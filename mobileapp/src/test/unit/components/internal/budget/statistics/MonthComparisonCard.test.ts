import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MonthComparisonCard from '$lib/components/internal/budget/statistics/MonthComparisonCard.svelte';

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
			date: (date: Date, format?: string) => {
				if (format === 'MMMM yyyy') return 'February 2026';
				if (format === 'MMM') return 'Jan';
				return date.toISOString();
			}
		}
	};
});

const now = new TZDate();
const currentMonth = now.toISOString().slice(0, 7);
const lastMonth = new TZDate(now.getFullYear(), now.getMonth() - 1, 15).toISOString().slice(0, 7);

const mockPostings = [
	{ amountInCents: 1000, date: `${currentMonth}-10`, type: 'CREDIT' as const },
	{ amountInCents: 500, date: `${currentMonth}-15`, type: 'DEBIT' as const },
	{ amountInCents: 800, date: `${lastMonth}-10`, type: 'CREDIT' as const },
	{ amountInCents: 400, date: `${lastMonth}-15`, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/MonthComparisonCard', () => {
	it('renders card with title', () => {
		const { container } = render(MonthComparisonCard, {
			props: { postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('calculates current month totals', () => {
		const { container } = render(MonthComparisonCard, {
			props: { postings: mockPostings as never }
		});
		// Current month: credit=1000, debit=500
		expect(container.textContent).toContain('€10.00'); // credit
		expect(container.textContent).toContain('€5.00'); // debit
	});

	it('shows change indicators', () => {
		const { container } = render(MonthComparisonCard, {
			props: { postings: mockPostings as never }
		});
		// Should have icons for change direction
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('handles empty postings', () => {
		const { container } = render(MonthComparisonCard, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
		expect(container.textContent).toContain('€0.00');
	});

	it('handles postings only in current month', () => {
		const currentMonthOnly = [{ amountInCents: 1000, date: `${currentMonth}-10`, type: 'CREDIT' as const }];
		const { container } = render(MonthComparisonCard, {
			props: { postings: currentMonthOnly as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles postings only in previous month', () => {
		const lastMonthOnly = [{ amountInCents: 800, date: `${lastMonth}-10`, type: 'CREDIT' as const }];
		const { container } = render(MonthComparisonCard, {
			props: { postings: lastMonthOnly as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows change indicator when previous month has data', () => {
		// Both months have credit and debit data so previousAmount > 0 triggers IconLabel
		const bothMonthPostings = [
			{ amountInCents: 2000, date: `${currentMonth}-10`, type: 'CREDIT' as const },
			{ amountInCents: 1500, date: `${currentMonth}-15`, type: 'DEBIT' as const },
			{ amountInCents: 1000, date: `${lastMonth}-10`, type: 'CREDIT' as const },
			{ amountInCents: 800, date: `${lastMonth}-15`, type: 'DEBIT' as const }
		];
		const { container } = render(MonthComparisonCard, {
			props: { postings: bothMonthPostings as never }
		});
		// Change indicator should show percentage
		expect(container.textContent).toContain('%');
	});
});
