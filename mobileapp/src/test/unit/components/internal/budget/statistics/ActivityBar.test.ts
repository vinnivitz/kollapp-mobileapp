import type { ActivityTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ActivityBar from '$lib/components/internal/budget/statistics/ActivityBar.svelte';

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

vi.mock('$app/paths', () => ({
	resolve: (path: string, parameters?: Record<string, string>) =>
		parameters ? path.replace('[slug]', parameters.slug ?? '') : path
}));

function makeActivities(): ActivityTO[] {
	return [
		{
			activityPostings: [
				{
					amountInCents: 10_000,
					date: new TZDate().toISOString(),
					id: 1,
					personOfOrganizationId: 1,
					purpose: 'Income',
					type: 'CREDIT'
				},
				{
					amountInCents: 3000,
					date: new TZDate().toISOString(),
					id: 2,
					personOfOrganizationId: 1,
					purpose: 'Expense',
					type: 'DEBIT'
				}
			],
			date: new TZDate().toISOString(),
			id: 1,
			name: 'Summer Party'
		},
		{
			activityPostings: [
				{
					amountInCents: 5000,
					date: new TZDate().toISOString(),
					id: 3,
					personOfOrganizationId: 1,
					purpose: 'Expense',
					type: 'DEBIT'
				}
			],
			date: new TZDate().toISOString(),
			id: 2,
			name: 'Workshop'
		}
	] as ActivityTO[];
}

describe('widgets/budget/statistics/ActivityBar', () => {
	it('renders card with title', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: false }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty activities', () => {
		const { container } = render(ActivityBar, {
			props: { activities: [], isDarkMode: false }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows no-activities message when empty', () => {
		const { container } = render(ActivityBar, {
			props: { activities: [], isDarkMode: false }
		});
		expect(container.textContent).toBeTruthy();
	});

	it('displays activity names', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: false }
		});
		const text = container.textContent ?? '';
		expect(text).toContain('Summer Party');
		expect(text).toContain('Workshop');
	});

	it('displays formatted amounts', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: false }
		});
		const text = container.textContent ?? '';
		// Summer Party: credit 10000 = €100.00
		expect(text).toContain('€100.00');
	});

	it('shows summary statistics', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: false }
		});
		const text = container.textContent ?? '';
		// Should show total activities count = 2
		expect(text).toContain('2');
	});

	it('displays transaction count in notes', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: false }
		});
		const notes = container.querySelectorAll('ion-note');
		const noteTexts = [...notes].map((n) => n.textContent);
		// Summer Party has 2 postings, Workshop has 1
		expect(noteTexts.some((t) => t?.includes('2'))).toBe(true);
	});

	it('renders in dark mode', () => {
		const { container } = render(ActivityBar, {
			props: { activities: makeActivities(), isDarkMode: true }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('filters out activities with no postings', () => {
		const activities = [
			...makeActivities(),
			{ activityPostings: [], date: new TZDate().toISOString(), id: 3, name: 'Empty Activity' }
		] as ActivityTO[];
		const { container } = render(ActivityBar, {
			props: { activities, isDarkMode: false }
		});
		const text = container.textContent ?? '';
		expect(text).not.toContain('Empty Activity');
	});
});
