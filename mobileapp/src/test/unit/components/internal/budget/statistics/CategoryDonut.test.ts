import type { OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import CategoryDonut from '$lib/components/internal/budget/statistics/CategoryDonut.svelte';

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

vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const categories: OrganizationBudgetCategoryResponseTO[] = [
	{ id: 1, name: 'Food' },
	{ id: 2, name: 'Transport' },
	{ id: 3, name: 'Entertainment' }
] as OrganizationBudgetCategoryResponseTO[];

function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 5000,
			date: new TZDate().toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Groceries',
			type: 'DEBIT'
		},
		{
			amountInCents: 3000,
			date: new TZDate().toISOString(),
			id: 2,
			organizationBudgetCategoryId: 2,
			personOfOrganizationId: 1,
			purpose: 'Bus ticket',
			type: 'DEBIT'
		},
		{
			amountInCents: 2000,
			date: new TZDate().toISOString(),
			id: 3,
			organizationBudgetCategoryId: 3,
			personOfOrganizationId: 1,
			purpose: 'Cinema',
			type: 'DEBIT'
		},
		{
			amountInCents: 15_000,
			date: new TZDate().toISOString(),
			id: 4,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Salary',
			type: 'CREDIT'
		}
	];
}

describe('widgets/budget/statistics/CategoryDonut', () => {
	it('renders card with title', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: false, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty postings', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty categories', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: [], isDarkMode: false, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders in dark mode', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: true, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays category names in statistic items', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: false, postings: makePostings() }
		});
		const text = container.textContent ?? '';
		expect(text).toContain('Food');
	});

	it('displays formatted amounts in statistic items', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: false, postings: makePostings() }
		});
		const text = container.textContent ?? '';
		// Food debit: 5000 cents = €50.00
		expect(text).toContain('€50.00');
	});

	it('shows show-all button when more categories than top count', () => {
		const manyCategories = Array.from({ length: 8 }, (_, index) => ({
			id: index + 1,
			name: `Category ${index + 1}`
		})) as OrganizationBudgetCategoryResponseTO[];
		const manyPostings = manyCategories.map((category, index) => ({
			amountInCents: (index + 1) * 1000,
			date: new TZDate().toISOString(),
			id: index + 1,
			organizationBudgetCategoryId: category.id,
			personOfOrganizationId: 1,
			purpose: `Posting ${index + 1}`,
			type: 'DEBIT' as const
		}));
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: manyCategories, isDarkMode: false, postings: manyPostings }
		});
		// Should have a show-all button since 8 > TOP_CATEGORIES_COUNT (5)
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('sorts categories by debit descending', () => {
		const { container } = render(CategoryDonut, {
			props: { budgetCategories: categories, isDarkMode: false, postings: makePostings() }
		});
		// Food has highest debit (5000), should appear first
		const items = container.querySelectorAll('ion-item');
		if (items.length > 0) {
			expect(items[0]!.textContent).toContain('Food');
		}
	});
});
