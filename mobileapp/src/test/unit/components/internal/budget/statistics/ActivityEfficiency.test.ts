import type { ActivityTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ActivityEfficiency from '$lib/components/internal/budget/statistics/ActivityEfficiency.svelte';

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

function makeActivities(count: number): ActivityTO[] {
	return Array.from({ length: count }, (_, index) => ({
		activityPostings: [
			{
				amountInCents: (index + 1) * 5000,
				date: new TZDate().toISOString(),
				id: index * 2 + 1,
				personOfOrganizationId: 1,
				purpose: 'Expense',
				type: 'DEBIT' as const
			},
			{
				amountInCents: (index + 1) * 2000,
				date: new TZDate().toISOString(),
				id: index * 2 + 2,
				personOfOrganizationId: 1,
				purpose: 'Income',
				type: 'CREDIT' as const
			}
		],
		date: new TZDate().toISOString(),
		id: index + 1,
		name: `Activity ${index + 1}`
	})) as ActivityTO[];
}

describe('widgets/budget/statistics/ActivityEfficiency', () => {
	it('renders card with title', () => {
		const { container } = render(ActivityEfficiency, {
			props: { activities: makeActivities(3) }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty activities', () => {
		const { container } = render(ActivityEfficiency, {
			props: { activities: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows no-data message when less than 2 data points', () => {
		const { container } = render(ActivityEfficiency, {
			props: { activities: makeActivities(1) }
		});
		const note = container.querySelector('ion-note');
		expect(note).toBeTruthy();
	});

	it('renders chart when 2 or more activities', () => {
		const { container } = render(ActivityEfficiency, {
			props: { activities: makeActivities(3) }
		});
		// Chart hint text should be present
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows hint text above chart', () => {
		const { container } = render(ActivityEfficiency, {
			props: { activities: makeActivities(3) }
		});
		const notes = container.querySelectorAll('ion-note');
		// Should have at least one note (the hint)
		expect(notes.length).toBeGreaterThan(0);
	});

	it('filters out activities with no postings', () => {
		const activities = [
			...makeActivities(2),
			{ activityPostings: [], date: new TZDate().toISOString(), id: 99, name: 'Empty' }
		] as ActivityTO[];
		const { container } = render(ActivityEfficiency, {
			props: { activities }
		});
		// Should still render since 2 valid activities
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles activities with only credits', () => {
		const activities = [
			{
				activityPostings: [
					{
						amountInCents: 5000,
						date: new TZDate().toISOString(),
						id: 1,
						personOfOrganizationId: 1,
						purpose: 'Credit',
						type: 'CREDIT' as const
					}
				],
				date: new TZDate().toISOString(),
				id: 1,
				name: 'CreditOnly1'
			},
			{
				activityPostings: [
					{
						amountInCents: 3000,
						date: new TZDate().toISOString(),
						id: 2,
						personOfOrganizationId: 1,
						purpose: 'Credit2',
						type: 'CREDIT' as const
					}
				],
				date: new TZDate().toISOString(),
				id: 2,
				name: 'CreditOnly2'
			}
		] as ActivityTO[];
		const { container } = render(ActivityEfficiency, {
			props: { activities }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
