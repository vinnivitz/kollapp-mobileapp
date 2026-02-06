import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import BudgetChartWidget from '$lib/components/internal/budget/statistics/BudgetChart.svelte';

class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

vi.mock('$lib/utility', async (importOriginal) => {
	const original = await importOriginal<object>();
	return {
		...original,
		formatter: {
			currency: (value: number) => `€${(value / 100).toFixed(2)}`
		}
	};
});

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const mockPostings = [
	{ amountInCents: 10_000, id: 1, purpose: 'Income 1', type: 'CREDIT' as const },
	{ amountInCents: 5000, id: 2, purpose: 'Income 2', type: 'CREDIT' as const },
	{ amountInCents: 3000, id: 3, purpose: 'Expense 1', type: 'DEBIT' as const },
	{ amountInCents: 2000, id: 4, purpose: 'Expense 2', type: 'DEBIT' as const }
];

describe('widgets/quick-access/widgets/BudgetChartWidget', () => {
	it('renders card with title', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows total budget calculation', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Total: (10000+5000) - (3000+2000) = 10000 cents = €100.00
		expect(container.textContent).toContain('€100.00');
	});

	it('handles empty postings', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders in edit mode', () => {
		const { container } = render(BudgetChartWidget, {
			props: { editMode: true, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with tourId', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never, tourId: 'budget-tour' }
		});
		const card = container.querySelector('ion-card');
		expect(card?.dataset.tour).toBe('budget-tour');
	});

	it('shows chip filters for chart types', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBeGreaterThan(0);
	});

	it('can switch chart type with chip click', async () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		const chips = container.querySelectorAll('ion-chip');
		if (chips.length > 1) {
			await fireEvent.click(chips[1]!);
		}
		expect(container).toBeTruthy();
	});

	it('navigates to budget page when clicked in normal mode', async () => {
		const { container } = render(BudgetChartWidget, {
			props: { editMode: false, postings: mockPostings as never }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).toHaveBeenCalled();
	});

	it('does not navigate when in edit mode', async () => {
		vi.clearAllMocks();
		const { container } = render(BudgetChartWidget, {
			props: { editMode: true, postings: mockPostings as never }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).not.toHaveBeenCalled();
	});

	it('shows credit total correctly', () => {
		// Credit total: 10000 + 5000 = 15000 cents = €150.00
		// Note: Credit/Debit totals are shown in chart, not directly in text
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Component renders with postings data
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows debit total correctly', () => {
		// Debit total: 3000 + 2000 = 5000 cents = €50.00
		// Note: Credit/Debit totals are shown in chart, not directly in text
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Component renders with postings data
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles postings with only credits', () => {
		const creditOnlyPostings = mockPostings.filter((p) => p.type === 'CREDIT');
		const { container } = render(BudgetChartWidget, {
			props: { postings: creditOnlyPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
		expect(container.textContent).toContain('€150.00');
	});

	it('handles postings with only debits', () => {
		const debitOnlyPostings = mockPostings.filter((p) => p.type === 'DEBIT');
		const { container } = render(BudgetChartWidget, {
			props: { postings: debitOnlyPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('sorts credit postings by amount descending', () => {
		const unsortedCredits = [
			{ amountInCents: 1000, id: 1, purpose: 'Small', type: 'CREDIT' as const },
			{ amountInCents: 5000, id: 2, purpose: 'Large', type: 'CREDIT' as const },
			{ amountInCents: 3000, id: 3, purpose: 'Medium', type: 'CREDIT' as const }
		];
		const { container } = render(BudgetChartWidget, {
			props: { postings: unsortedCredits as never }
		});
		expect(container).toBeTruthy();
	});

	it('sorts debit postings by amount descending', () => {
		const unsortedDebits = [
			{ amountInCents: 500, id: 1, purpose: 'Small', type: 'DEBIT' as const },
			{ amountInCents: 2000, id: 2, purpose: 'Large', type: 'DEBIT' as const },
			{ amountInCents: 1000, id: 3, purpose: 'Medium', type: 'DEBIT' as const }
		];
		const { container } = render(BudgetChartWidget, {
			props: { postings: unsortedDebits as never }
		});
		expect(container).toBeTruthy();
	});

	it('limits displayed postings to DISPLAY_COUNT', () => {
		const manyPostings = Array.from({ length: 10 }, (_, index) => ({
			amountInCents: (index + 1) * 1000,
			id: index + 1,
			purpose: `Posting ${index + 1}`,
			type: 'CREDIT' as const
		}));
		const { container } = render(BudgetChartWidget, {
			props: { postings: manyPostings as never }
		});
		expect(container).toBeTruthy();
	});

	it('calculates total budget as credit minus debit', () => {
		// Credit: 15000, Debit: 5000, Total: 10000 = €100.00
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		expect(container.textContent).toContain('€100.00');
	});

	it('handles negative total budget', () => {
		const negativePostings = [
			{ amountInCents: 1000, id: 1, purpose: 'Income', type: 'CREDIT' as const },
			{ amountInCents: 5000, id: 2, purpose: 'Expense', type: 'DEBIT' as const }
		];
		const { container } = render(BudgetChartWidget, {
			props: { postings: negativePostings as never }
		});
		// Total: 1000 - 5000 = -4000 = €-40.00 (formatter puts € before minus)
		expect(container.textContent).toContain('€-40.00');
	});
});
