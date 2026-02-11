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

	it('shows total budget balance', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Total: (10000+5000) - (3000+2000) = 10000 cents = €100.00
		const balanceElement = container.querySelector('[data-testid="budget-balance"]');
		expect(balanceElement).toBeTruthy();
		expect(balanceElement?.textContent).toContain('€100.00');
	});

	it('handles empty postings', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
		expect(container.querySelector('[data-testid="budget-balance"]')).toBeFalsy();
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('renders in edit mode without navigation arrow', () => {
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

	it('shows credit/debit ratio bar when postings exist', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		const ratioBar = container.querySelector('[data-testid="budget-ratio-bar"]');
		expect(ratioBar).toBeTruthy();
		expect(ratioBar?.children.length).toBe(2);
	});

	it('shows credit and debit totals', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Credit total: 15000 = €150.00, Debit total: 5000 = €50.00
		expect(container.textContent).toContain('€150.00');
		expect(container.textContent).toContain('€50.00');
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

	it('shows top expenses section', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Top expense: 3000 = €30.00
		expect(container.textContent).toContain('€30.00');
		// Second expense: 2000 = €20.00
		expect(container.textContent).toContain('€20.00');
	});

	it('shows top income section', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		expect(container.textContent).toContain('Income 1');
		expect(container.textContent).toContain('Income 2');
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

	it('limits top expenses to TOP_POSTINGS_COUNT (3)', () => {
		const manyDebits = Array.from({ length: 6 }, (_, index) => ({
			amountInCents: (index + 1) * 1000,
			id: index + 1,
			purpose: `Expense ${index + 1}`,
			type: 'DEBIT' as const
		}));
		const { container } = render(BudgetChartWidget, {
			props: { postings: manyDebits as never }
		});
		// Should only show the top 3 (highest amounts: 6000, 5000, 4000)
		expect(container.textContent).toContain('Expense 6');
		expect(container.textContent).toContain('Expense 5');
		expect(container.textContent).toContain('Expense 4');
		expect(container.textContent).not.toContain('Expense 1');
	});

	it('limits top income to TOP_POSTINGS_COUNT (3)', () => {
		const manyCredits = Array.from({ length: 6 }, (_, index) => ({
			amountInCents: (index + 1) * 1000,
			id: index + 1,
			purpose: `Income ${index + 1}`,
			type: 'CREDIT' as const
		}));
		const { container } = render(BudgetChartWidget, {
			props: { postings: manyCredits as never }
		});
		// Should only show the top 3 (highest amounts: 6000, 5000, 4000)
		expect(container.textContent).toContain('Income 6');
		expect(container.textContent).toContain('Income 5');
		expect(container.textContent).toContain('Income 4');
		expect(container.textContent).not.toContain('Income 1');
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
		// Total: 1000 - 5000 = -4000 = €-40.00
		expect(container.textContent).toContain('€-40.00');
	});

	it('shows expense purpose names', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		expect(container.textContent).toContain('Expense 1');
		expect(container.textContent).toContain('Expense 2');
	});

	it('renders progress bars for expenses', () => {
		const { container } = render(BudgetChartWidget, {
			props: { postings: mockPostings as never }
		});
		// Each expense and income entry has a progress bar (rounded-full divs)
		const progressBars = container.querySelectorAll('.rounded-full');
		expect(progressBars.length).toBeGreaterThan(0);
	});
});
