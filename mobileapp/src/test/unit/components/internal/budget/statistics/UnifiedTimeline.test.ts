import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import UnifiedTimeline from '$lib/components/internal/budget/statistics/UnifiedTimeline.svelte';

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
			date: (_date: Date, format?: string) => format ?? '2024-01'
		},
		withLoader: vi.fn()
	};
});

vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const now = new TZDate();

function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 10_000,
			date: new TZDate(now.getFullYear(), 0, 15).toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Jan Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 5000,
			date: new TZDate(now.getFullYear(), 0, 20).toISOString(),
			id: 2,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Jan Debit',
			type: 'DEBIT'
		},
		{
			amountInCents: 8000,
			date: new TZDate(now.getFullYear(), 1, 10).toISOString(),
			id: 3,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Feb Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 3000,
			date: new TZDate(now.getFullYear(), 1, 15).toISOString(),
			id: 4,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Feb Debit',
			type: 'DEBIT'
		}
	];
}

describe('widgets/budget/statistics/UnifiedTimeline', () => {
	it('renders card with title', () => {
		const { container } = render(UnifiedTimeline, {
			props: { isDarkMode: false, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty postings', () => {
		const { container } = render(UnifiedTimeline, {
			props: { isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders in dark mode', () => {
		const { container } = render(UnifiedTimeline, {
			props: { isDarkMode: true, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles single month of postings', () => {
		const postings: PostingTO[] = [
			{
				amountInCents: 5000,
				date: new TZDate(now.getFullYear(), 0, 15).toISOString(),
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Only posting',
				type: 'CREDIT'
			}
		];
		const { container } = render(UnifiedTimeline, {
			props: { isDarkMode: false, postings }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles only credit postings', () => {
		const postings: PostingTO[] = [
			{
				amountInCents: 10_000,
				date: new TZDate(now.getFullYear(), 0, 15).toISOString(),
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Credit only',
				type: 'CREDIT'
			},
			{
				amountInCents: 5000,
				date: new TZDate(now.getFullYear(), 1, 15).toISOString(),
				id: 2,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Credit only 2',
				type: 'CREDIT'
			}
		];
		const { container } = render(UnifiedTimeline, {
			props: { isDarkMode: false, postings }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
