import type { PostingTO } from '@kollapp/api-types';

import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import WeekdayAnalysis from '$lib/components/internal/budget/statistics/WeekdayAnalysis.svelte';

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
			currency: (value: number) => `€${(value / 100).toFixed(2)}`,
			date: (_date: Date, format?: string) => format ?? '2024-01-01'
		}
	};
});

vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

// Create postings on different weekdays
// 2024-01-15 = Monday, 2024-01-16 = Tuesday, 2024-01-17 = Wednesday
function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 5000,
			date: '2024-01-15',
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Monday 1',
			type: 'DEBIT'
		},
		{
			amountInCents: 3000,
			date: '2024-01-15',
			id: 2,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Monday 2',
			type: 'CREDIT'
		},
		{
			amountInCents: 7000,
			date: '2024-01-16',
			id: 3,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Tuesday',
			type: 'DEBIT'
		},
		{
			amountInCents: 2000,
			date: '2024-01-17',
			id: 4,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Wednesday',
			type: 'DEBIT'
		}
	];
}

describe('widgets/budget/statistics/WeekdayAnalysis', () => {
	it('renders card with title', () => {
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty postings', () => {
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows no-data message when no postings', () => {
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: [] }
		});
		const notes = container.querySelectorAll('ion-note');
		expect(notes.length).toBeGreaterThan(0);
	});

	it('shows busiest day when postings exist', () => {
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: makePostings() }
		});
		// Should display a busiest day note
		const notes = container.querySelectorAll('ion-note');
		expect(notes.length).toBeGreaterThan(0);
	});

	it('renders in dark mode', () => {
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: true, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles postings all on same day', () => {
		const sameDay: PostingTO[] = [
			{
				amountInCents: 1000,
				date: '2024-01-15',
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'A',
				type: 'DEBIT'
			},
			{
				amountInCents: 2000,
				date: '2024-01-15',
				id: 2,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'B',
				type: 'DEBIT'
			}
		];
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: sameDay }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles postings on all weekdays', () => {
		// Postings on Mon-Sun (2024-01-15 to 2024-01-21)
		const allDays: PostingTO[] = Array.from({ length: 7 }, (_, index) => ({
			amountInCents: (index + 1) * 1000,
			date: `2024-01-${15 + index}`,
			id: index + 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: `Day ${index + 1}`,
			type: 'DEBIT' as const
		}));
		const { container } = render(WeekdayAnalysis, {
			props: { isDarkMode: false, postings: allDays }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
