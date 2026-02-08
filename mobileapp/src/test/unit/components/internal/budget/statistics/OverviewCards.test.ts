import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import OverviewCards from '$lib/components/internal/budget/statistics/OverviewCards.svelte';

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

describe('widgets/budget/statistics/OverviewCards', () => {
	it('renders overview cards with wrapper', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		const cards = container.querySelectorAll('ion-card');
		expect(cards.length).toBe(5);
	});

	it('displays total credit amount', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		expect(container.textContent).toContain('€200.00');
	});

	it('displays total debit amount', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		expect(container.textContent).toContain('€125.00');
	});

	it('displays balance amount', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		expect(container.textContent).toContain('€75.00');
	});

	it('displays average transaction amount', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		expect(container.textContent).toContain('€50.00');
	});

	it('shows icons for each card', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: 7500, totalCredit: 20_000, totalDebit: 12_500 }
		});
		const icons = container.querySelectorAll('ion-icon');
		expect(icons.length).toBe(5);
	});

	it('handles zero values', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 0, balance: 0, totalCredit: 0, totalDebit: 0 }
		});
		const cards = container.querySelectorAll('ion-card');
		expect(cards.length).toBe(5);
		expect(container.textContent).toContain('€0.00');
	});

	it('handles negative balance', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 5000, balance: -5000, totalCredit: 10_000, totalDebit: 15_000 }
		});
		expect(container.textContent).toContain('€-50.00');
	});

	it('renders with large numbers', () => {
		const { container } = render(OverviewCards, {
			props: { averageTransaction: 999_999, balance: 500_000, totalCredit: 1_000_000, totalDebit: 500_000 }
		});
		expect(container.textContent).toContain('€10000.00');
	});
});
