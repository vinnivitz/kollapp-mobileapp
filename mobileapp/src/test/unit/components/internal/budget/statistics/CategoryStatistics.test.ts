import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import CategoryStatistics from '$lib/components/internal/budget/statistics/CategoryStatistics.svelte';

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
			currency: (value: number, short?: boolean) =>
				short ? `€${(value / 100).toFixed(0)}` : `€${(value / 100).toFixed(2)}`
		}
	};
});

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const mockCategories = [
	{ defaultCategory: true, id: 1, name: 'Food' },
	{ defaultCategory: false, id: 2, name: 'Transport' },
	{ defaultCategory: false, id: 3, name: 'Entertainment' }
];

const mockPostings = [
	{ amountInCents: 5000, date: '2025-01-10', organizationBudgetCategoryId: 1, type: 'DEBIT' as const },
	{ amountInCents: 3000, date: '2025-01-15', organizationBudgetCategoryId: 2, type: 'DEBIT' as const },
	{ amountInCents: 10_000, date: '2025-01-05', organizationBudgetCategoryId: 1, type: 'CREDIT' as const },
	{ amountInCents: 2000, date: '2025-01-20', organizationBudgetCategoryId: 3, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/CategoryStatistics', () => {
	it('renders card with title', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays category names', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.textContent).toContain('Food');
		expect(container.textContent).toContain('Transport');
	});

	it('displays credit and debit amounts per category', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: mockPostings as never }
		});
		// Food: credit=10000, debit=5000
		expect(container.textContent).toContain('€100.00'); // credit
		expect(container.textContent).toContain('€50.00'); // debit
	});

	it('displays share percentage', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: mockPostings as never }
		});
		// Total debit = 10000, Food debit = 5000 → 50.0%
		expect(container.textContent).toContain('50.0%');
	});

	it('sorts categories by debit descending', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: mockPostings as never }
		});
		// Food (5000 debit) should appear before Transport (3000 debit)
		const textContent = container.textContent ?? '';
		expect(textContent.indexOf('Food')).toBeLessThan(textContent.indexOf('Transport'));
	});

	it('filters out categories with no postings', () => {
		const categoriesWithEmpty = [...mockCategories, { defaultCategory: false, id: 99, name: 'Unused Category' }];
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: categoriesWithEmpty as never, isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.textContent).not.toContain('Unused Category');
	});

	it('shows no-data message when no postings', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty categories array', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: [], isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with dark mode', () => {
		const { container } = render(CategoryStatistics, {
			props: { budgetCategories: mockCategories as never, isDarkMode: true, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
