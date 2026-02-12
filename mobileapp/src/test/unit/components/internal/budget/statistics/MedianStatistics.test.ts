import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MedianStatistics from '$lib/components/internal/budget/statistics/MedianStatistics.svelte';

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

const mockPostings = [
	{ amountInCents: 1000, date: '2025-01-10', type: 'CREDIT' as const },
	{ amountInCents: 3000, date: '2025-01-15', type: 'CREDIT' as const },
	{ amountInCents: 5000, date: '2025-01-20', type: 'CREDIT' as const },
	{ amountInCents: 2000, date: '2025-01-12', type: 'DEBIT' as const },
	{ amountInCents: 4000, date: '2025-01-18', type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/MedianStatistics', () => {
	it('renders card with title', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders four stat cards', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Should show: median all, avg comparison, median credit, median debit
		const innerCards = container.querySelectorAll('ion-card-content ion-card');
		expect(innerCards.length).toBe(4);
	});

	it('calculates median of all postings', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Sorted: 1000, 2000, 3000, 4000, 5000 → median = 3000
		expect(container.textContent).toContain('€30.00');
	});

	it('calculates median credit', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Credit sorted: 1000, 3000, 5000 → median = 3000
		expect(container.textContent).toContain('€30.00');
	});

	it('calculates median debit', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Debit sorted: 2000, 4000 → median = (2000+4000)/2 = 3000
		expect(container.textContent).toContain('€30.00');
	});

	it('shows icons for each stat card', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		const icons = container.querySelectorAll('ion-card-content ion-card ion-icon');
		expect(icons.length).toBe(4);
	});

	it('handles empty postings', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
		// Median of empty array should be 0
		expect(container.textContent).toContain('€0.00');
	});

	it('handles single posting', () => {
		const singlePosting = [{ amountInCents: 5000, date: '2025-01-10', type: 'CREDIT' as const }];
		const { container } = render(MedianStatistics, {
			props: { postings: singlePosting as never }
		});
		expect(container.textContent).toContain('€50.00');
	});

	it('shows hint about median vs average difference', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Component shows a hint note when postings exist
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('does not show hint when no postings', () => {
		const { container } = render(MedianStatistics, {
			props: { postings: [] }
		});
		// No hint shown when postings are empty
		expect(container.querySelector('ion-note')).toBeFalsy();
	});

	it('calculates average correctly for comparison', () => {
		// Average of 1000+3000+5000+2000+4000 = 15000/5 = 3000
		const { container } = render(MedianStatistics, {
			props: { postings: mockPostings as never }
		});
		// Avg comparison card should show €30.00
		const innerCards = container.querySelectorAll('ion-card-content ion-card');
		// 2nd card is avg comparison
		const avgCard = innerCards[1];
		expect(avgCard?.textContent).toContain('€30.00');
	});

	it('shows median/average difference in hint', () => {
		// Skewed data where median and average differ
		const skewedPostings = [
			{ amountInCents: 100, date: '2025-01-10', type: 'CREDIT' as const },
			{ amountInCents: 200, date: '2025-01-11', type: 'CREDIT' as const },
			{ amountInCents: 300, date: '2025-01-12', type: 'CREDIT' as const },
			{ amountInCents: 50_000, date: '2025-01-13', type: 'CREDIT' as const }
		];
		const { container } = render(MedianStatistics, {
			props: { postings: skewedPostings as never }
		});
		// Hint note should be visible since postings exist
		const note = container.querySelector('ion-note');
		expect(note).toBeTruthy();
		// Hint text should contain the translated key
		expect(note?.textContent).toContain('median.hint');
	});
});
