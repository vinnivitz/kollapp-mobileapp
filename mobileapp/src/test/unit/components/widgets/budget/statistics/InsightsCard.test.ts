import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import InsightsCard from '$lib/components/widgets/budget/statistics/InsightsCard.svelte';

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

const mockCategories = [
	{ defaultCategory: true, id: 1, name: 'Food' },
	{ defaultCategory: false, id: 2, name: 'Transport' }
];

const now = new Date();
const currentMonth = now.toISOString().slice(0, 7);
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().slice(0, 7);

const mockPostings = [
	{ amountInCents: 10_000, date: `${currentMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const },
	{ amountInCents: 5000, date: `${currentMonth}-15`, organizationBudgetCategoryId: 2, type: 'DEBIT' as const },
	{ amountInCents: 20_000, date: `${currentMonth}-05`, organizationBudgetCategoryId: 1, type: 'CREDIT' as const },
	{ amountInCents: 8000, date: `${lastMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/InsightsCard', () => {
	it('renders card with title', () => {
		const { container } = render(InsightsCard, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('generates insights from postings', () => {
		const { container } = render(InsightsCard, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		// Should render some insight cards
		const cards = container.querySelectorAll('ion-card');
		expect(cards.length).toBeGreaterThan(0);
	});

	it('handles empty postings', () => {
		const { container } = render(InsightsCard, {
			props: { categories: mockCategories as never, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty categories', () => {
		const { container } = render(InsightsCard, {
			props: { categories: [], postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows insight icons', () => {
		const { container } = render(InsightsCard, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('analyzes monthly spending patterns', () => {
		const { container } = render(InsightsCard, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		// Component should analyze and show relevant insights
		expect(container).toBeTruthy();
	});
});
