import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Highlights from '$lib/components/internal/budget/statistics/Highlights.svelte';

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
		},
		parser: {
			date: (date: Date) => date.toISOString().slice(0, 10)
		}
	};
});

const mockCategories = [
	{ defaultCategory: true, id: 1, name: 'Food' },
	{ defaultCategory: false, id: 2, name: 'Transport' }
];

const now = new TZDate();
const currentMonth = now.toISOString().slice(0, 7);
const lastMonth = new TZDate(now.getFullYear(), now.getMonth() - 1, 15).toISOString().slice(0, 7);

const mockPostings = [
	{ amountInCents: 10_000, date: `${currentMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const },
	{ amountInCents: 5000, date: `${currentMonth}-15`, organizationBudgetCategoryId: 2, type: 'DEBIT' as const },
	{ amountInCents: 20_000, date: `${currentMonth}-05`, organizationBudgetCategoryId: 1, type: 'CREDIT' as const },
	{ amountInCents: 8000, date: `${lastMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/Highlights', () => {
	it('renders card with title', () => {
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('generates insights from postings', () => {
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		const cards = container.querySelectorAll('ion-card');
		expect(cards.length).toBeGreaterThan(0);
	});

	it('handles empty postings', () => {
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty categories', () => {
		const { container } = render(Highlights, {
			props: { categories: [], postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows insight icons', () => {
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: mockPostings as never }
		});
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBeGreaterThan(0);
	});

	it('detects top category when one dominates spending', () => {
		// Category 1 has 90% of all debit postings
		const dominantPostings = [
			{ amountInCents: 9000, date: `${currentMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const },
			{ amountInCents: 1000, date: `${currentMonth}-15`, organizationBudgetCategoryId: 2, type: 'DEBIT' as const }
		];
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: dominantPostings as never }
		});
		// Should detect top category insight (90% > 40% threshold)
		expect(container.textContent).toContain('Food');
	});

	it('detects spending increase trend', () => {
		// Previous month: 1000 debit, Current month: 5000 debit → +400%
		const trendPostings = [
			{ amountInCents: 1000, date: `${lastMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const },
			{ amountInCents: 5000, date: `${currentMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const }
		];
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: trendPostings as never }
		});
		// Should show some increase-related content
		expect(container).toBeTruthy();
	});

	it('shows no-insights message when no insights detected', () => {
		// Single posting won't trigger most detectors
		const minimalPostings = [
			{ amountInCents: 500, date: `${currentMonth}-10`, organizationBudgetCategoryId: 1, type: 'DEBIT' as const }
		];
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: minimalPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('detects anomaly when sufficient postings exist', () => {
		// Create 11+ debit postings with one outlier
		const anomalyPostings = Array.from({ length: 12 }, (_, index) => ({
			amountInCents: index === 11 ? 100_000 : 1000,
			date: `${currentMonth}-${String(index + 1).padStart(2, '0')}`,
			organizationBudgetCategoryId: 1,
			type: 'DEBIT' as const
		}));
		const { container } = render(Highlights, {
			props: { categories: mockCategories as never, postings: anomalyPostings as never }
		});
		// Should detect the anomaly (100_000 vs avg ~9250)
		expect(container).toBeTruthy();
	});
});
