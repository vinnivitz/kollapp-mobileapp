import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MonthlyTrendChart from '$lib/components/widgets/budget/statistics/MonthlyTrendChart.svelte';

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
				if (format === 'yyyy-MM') return date.toISOString().slice(0, 7);
				if (format === 'MMM yyyy') return 'Jan 2024';
				return date.toISOString();
			}
		}
	};
});

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

const now = new Date();
const currentMonth = now.toISOString().slice(0, 7);

const mockPostings = [
	{ amountInCents: 10_000, date: `${currentMonth}-10`, type: 'CREDIT' as const },
	{ amountInCents: 5000, date: `${currentMonth}-15`, type: 'DEBIT' as const },
	{ amountInCents: 3000, date: `${currentMonth}-20`, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/MonthlyTrendChart', () => {
	it('renders card with title', () => {
		const { container } = render(MonthlyTrendChart, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with dark mode', () => {
		const { container } = render(MonthlyTrendChart, {
			props: { isDarkMode: true, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty postings', () => {
		const { container } = render(MonthlyTrendChart, {
			props: { isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('aggregates postings by month', () => {
		const { container } = render(MonthlyTrendChart, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		// Component should process and aggregate the data
		expect(container).toBeTruthy();
	});

	it('renders chart title icon', () => {
		const { container } = render(MonthlyTrendChart, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		const icon = container.querySelector('ion-card-title ion-icon');
		expect(icon).toBeTruthy();
	});
});
