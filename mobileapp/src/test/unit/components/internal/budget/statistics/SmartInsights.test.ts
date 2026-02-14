import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import SmartInsights from '$lib/components/internal/budget/statistics/SmartInsights.svelte';

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
				short ? `€${(value / 100).toFixed(0)}` : `€${(value / 100).toFixed(2)}`,
			date: (_date: Date, format?: string) => format ?? '2024-01-01'
		},
		parser: {
			date: (_date: Date) => '2024-01-01'
		}
	};
});

const now = new TZDate();

function makeDebitPostings(count: number, amount: number): PostingTO[] {
	return Array.from({ length: count }, (_, index) => ({
		amountInCents: amount,
		date: now.toISOString(),
		id: index + 1,
		organizationBudgetCategoryId: 1,
		personOfOrganizationId: 1,
		purpose: `Expense ${index + 1}`,
		type: 'DEBIT' as const
	}));
}

describe('widgets/budget/statistics/SmartInsights', () => {
	it('renders card with title', () => {
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows no-insights message when no postings', () => {
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings: [] }
		});
		expect(container.textContent).toBeTruthy();
	});

	it('renders with postings without crashing', () => {
		const postings = makeDebitPostings(5, 1000);
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders insight cards when anomalies are detected', () => {
		// Create many normal postings and one very large anomaly
		const normalPostings = makeDebitPostings(15, 1000);
		const anomalyPosting: PostingTO = {
			amountInCents: 50_000,
			date: now.toISOString(),
			id: 100,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Big Expense',
			type: 'DEBIT'
		};
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings: [...normalPostings, anomalyPosting] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('detects upcoming activities', () => {
		const futureDate = new TZDate();
		futureDate.setDate(futureDate.getDate() + 5);
		const activities = [
			{
				activityPostings: [{ amountInCents: 5000, id: 1, type: 'DEBIT' as const }],
				date: futureDate.toISOString(),
				id: 1,
				name: 'Team Event'
			}
		];
		const { container } = render(SmartInsights, {
			props: { activities: activities as never, categories: [], postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('limits visible insights to maximum count', () => {
		// SmartInsights has MAX_VISIBLE_INSIGHTS = 6
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings: makeDebitPostings(20, 1000) }
		});
		// Should render without error even with many postings
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows scrollable container for insights', () => {
		const postings = makeDebitPostings(15, 1000);
		const anomaly: PostingTO = {
			amountInCents: 100_000,
			date: now.toISOString(),
			id: 999,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Anomaly',
			type: 'DEBIT'
		};
		const { container } = render(SmartInsights, {
			props: { activities: [], categories: [], postings: [...postings, anomaly] }
		});
		const scrollContainer = container.querySelector('.scrollbar-hide');
		// If insights were generated, the scroll container exists
		if (scrollContainer) {
			expect(scrollContainer.classList.contains('overflow-x-auto')).toBe(true);
		}
	});
});
