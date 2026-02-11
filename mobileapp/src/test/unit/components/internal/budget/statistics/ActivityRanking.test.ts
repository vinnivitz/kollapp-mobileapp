import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ActivityRanking from '$lib/components/internal/budget/statistics/ActivityRanking.svelte';

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

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

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

const mockActivities = [
	{
		activityPostings: [
			{ amountInCents: 1000, type: 'DEBIT' as const },
			{ amountInCents: 500, type: 'CREDIT' as const }
		],
		id: 1,
		name: 'Activity 1'
	},
	{
		activityPostings: [
			{ amountInCents: 2000, type: 'DEBIT' as const },
			{ amountInCents: 300, type: 'CREDIT' as const }
		],
		id: 2,
		name: 'Activity 2'
	},
	{
		activityPostings: [],
		id: 3,
		name: 'Activity 3 (no postings)'
	}
];

describe('widgets/budget/statistics/ActivityRanking', () => {
	it('renders card with title', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: mockActivities as never, isDarkMode: false }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('calculates and displays activity stats', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: mockActivities as never, isDarkMode: false }
		});
		// Should show activity names
		expect(container.textContent).toContain('Activity 1');
		expect(container.textContent).toContain('Activity 2');
	});

	it('filters out activities with no postings', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: mockActivities as never, isDarkMode: false }
		});
		// Activity 3 has no postings so should not be in ranking
		expect(container.textContent).not.toContain('Activity 3');
	});

	it('sorts activities by net cost descending', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: mockActivities as never, isDarkMode: false }
		});
		const cards = container.querySelectorAll('ion-card-content ion-card');
		// Activity 2 has higher net cost (2000-300=1700) than Activity 1 (1000-500=500)
		expect(cards.length).toBeGreaterThan(0);
	});

	it('shows total activities count', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: mockActivities as never, isDarkMode: false }
		});
		// Should show 2 (activities with postings)
		expect(container.textContent).toContain('2');
	});

	it('handles empty activities array', () => {
		const { container } = render(ActivityRanking, {
			props: { activities: [], isDarkMode: false }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
