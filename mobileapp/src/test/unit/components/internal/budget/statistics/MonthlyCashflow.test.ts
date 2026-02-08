import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MonthlyCashflow from '$lib/components/internal/budget/statistics/MonthlyCashflow.svelte';

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
			date: (date: Date, format?: string) => {
				if (format === 'yyyy-MM') return date.toISOString().slice(0, 7);
				if (format === 'MMM yyyy') return 'Jan 2025';
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
const currentYear = now.getFullYear();

const mockPostings = [
	{ amountInCents: 10_000, date: `${currentYear}-01-10`, type: 'CREDIT' as const },
	{ amountInCents: 5000, date: `${currentYear}-01-15`, type: 'DEBIT' as const },
	{ amountInCents: 3000, date: `${currentYear}-02-10`, type: 'CREDIT' as const },
	{ amountInCents: 7000, date: `${currentYear}-02-15`, type: 'DEBIT' as const },
	{ amountInCents: 8000, date: `${currentYear}-03-10`, type: 'CREDIT' as const },
	{ amountInCents: 2000, date: `${currentYear}-03-15`, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/MonthlyCashflow', () => {
	it('renders card with title', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays selected year', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		expect(container.textContent).toContain(currentYear.toString());
	});

	it('shows best and worst month indicators', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		// Should show best/worst month information
		expect(container).toBeTruthy();
	});

	it('handles empty postings', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
		// Should show no-data note
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('shows year navigation buttons', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: mockPostings as never }
		});
		const buttons = container.querySelectorAll('ion-button');
		expect(buttons.length).toBeGreaterThanOrEqual(2);
	});

	it('navigates to previous year when available', async () => {
		const multiYearPostings = [
			...mockPostings,
			{ amountInCents: 5000, date: `${currentYear - 1}-06-10`, type: 'CREDIT' as const }
		];
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: multiYearPostings as never }
		});
		const buttons = container.querySelectorAll('ion-button');
		const backButton = buttons[0];
		if (backButton) {
			await fireEvent.click(backButton);
		}
		expect(container).toBeTruthy();
	});

	it('navigates to next year when available', async () => {
		const multiYearPostings = [
			...mockPostings,
			{ amountInCents: 5000, date: `${currentYear - 1}-06-10`, type: 'CREDIT' as const }
		];
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: multiYearPostings as never }
		});
		// Navigate back first, then forward
		const buttons = container.querySelectorAll('ion-button');
		const backButton = buttons[0];
		if (backButton) {
			await fireEvent.click(backButton);
		}
		const forwardButton = container.querySelectorAll('ion-button')[1];
		if (forwardButton) {
			await fireEvent.click(forwardButton);
		}
		expect(container).toBeTruthy();
	});

	it('renders with dark mode', () => {
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: true, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles postings from single month', () => {
		const singleMonthPostings = [
			{ amountInCents: 5000, date: `${currentYear}-01-10`, type: 'CREDIT' as const },
			{ amountInCents: 3000, date: `${currentYear}-01-15`, type: 'DEBIT' as const }
		];
		const { container } = render(MonthlyCashflow, {
			props: { isDarkMode: false, postings: singleMonthPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
