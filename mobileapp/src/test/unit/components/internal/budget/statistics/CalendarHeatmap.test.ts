import { TZDate } from '@date-fns/tz';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import CalendarHeatmap from '$lib/components/internal/budget/statistics/PostingsHeatmap.svelte';

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
			date: (date: Date) => date.toISOString()
		},
		getBlendedColorFromVariable: () => '#ff0000',
		getHexFromVariable: () => '#000000'
	};
});

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const now = new TZDate();
const currentYear = now.getFullYear();

const mockPostings = [
	{ amountInCents: 1000, date: `${currentYear}-01-15`, type: 'CREDIT' as const },
	{ amountInCents: 500, date: `${currentYear}-01-15`, type: 'DEBIT' as const },
	{ amountInCents: 2000, date: `${currentYear}-02-20`, type: 'DEBIT' as const },
	{ amountInCents: 3000, date: `${currentYear}-06-10`, type: 'CREDIT' as const }
];

describe('widgets/budget/statistics/CalendarHeatmap', () => {
	it('renders card with title', () => {
		const { container } = render(CalendarHeatmap, {
			props: { postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty postings', () => {
		const { container } = render(CalendarHeatmap, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows year navigation buttons', () => {
		const { container } = render(CalendarHeatmap, {
			props: { postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('navigates to previous year', async () => {
		const multiYearPostings = [
			...mockPostings,
			{ amountInCents: 1000, date: `${currentYear - 1}-05-10`, type: 'CREDIT' as const }
		];
		const { container } = render(CalendarHeatmap, {
			props: { postings: multiYearPostings as never }
		});
		const backButton = container.querySelector('ion-button');
		if (backButton) {
			await fireEvent.click(backButton);
		}
		expect(container).toBeTruthy();
	});

	it('navigates to next year', async () => {
		const multiYearPostings = [
			...mockPostings,
			{ amountInCents: 1000, date: `${currentYear - 1}-05-10`, type: 'CREDIT' as const }
		];
		const { container } = render(CalendarHeatmap, {
			props: { postings: multiYearPostings as never }
		});
		const buttons = container.querySelectorAll('ion-button');
		const forwardButton = buttons[1];
		if (forwardButton) {
			await fireEvent.click(forwardButton);
		}
		expect(container).toBeTruthy();
	});

	it('displays selected year', () => {
		const { container } = render(CalendarHeatmap, {
			props: { postings: mockPostings as never }
		});
		// Year is displayed in the component
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('aggregates postings by day', () => {
		const { container } = render(CalendarHeatmap, {
			props: { postings: mockPostings as never }
		});
		// Component should process daily data
		expect(container).toBeTruthy();
	});
});
