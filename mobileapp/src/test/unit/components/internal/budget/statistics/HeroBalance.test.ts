import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import HeroBalance from '$lib/components/internal/budget/statistics/HeroBalance.svelte';

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
			date: (_date: Date, format?: string) => format ?? '2024-01-01'
		}
	};
});

function makePostings(type: 'CREDIT' | 'DEBIT', count: number, amount: number): PostingTO[] {
	return Array.from({ length: count }, (_, index) => ({
		amountInCents: amount,
		date: new TZDate().toISOString(),
		id: index + 1,
		organizationBudgetCategoryId: 1,
		personOfOrganizationId: 1,
		purpose: `Posting ${index + 1}`,
		type
	}));
}

const defaultProps = {
	averageTransaction: 5000,
	balance: 5000,
	postings: [...makePostings('CREDIT', 2, 10_000), ...makePostings('DEBIT', 2, 5000)],
	totalCredit: 20_000,
	totalDebit: 10_000,
	transactionCount: 4
};

describe('widgets/budget/statistics/HeroBalance', () => {
	it('renders card with title', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays formatted balance', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		expect(container.textContent).toContain('€50.00');
	});

	it('shows success color for positive balance', () => {
		const { container } = render(HeroBalance, { props: { ...defaultProps, balance: 5000 } });
		const balanceText = container.querySelector('.text-2xl.font-bold');
		expect(balanceText?.getAttribute('color')).toBe('success');
	});

	it('shows danger color for negative balance', () => {
		const { container } = render(HeroBalance, { props: { ...defaultProps, balance: -5000 } });
		const balanceText = container.querySelector('.text-2xl.font-bold');
		expect(balanceText?.getAttribute('color')).toBe('danger');
	});

	it('displays credit and debit amounts', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		const text = container.textContent ?? '';
		expect(text).toContain('€200.00');
		expect(text).toContain('€100.00');
	});

	it('renders ratio bar when total is positive', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		const ratioBar = container.querySelector('.rounded-full');
		expect(ratioBar).toBeTruthy();
	});

	it('renders mini KPI cards', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		const kpiCards = container.querySelectorAll('.rounded-lg');
		expect(kpiCards.length).toBeGreaterThanOrEqual(3);
	});

	it('displays transaction count', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		expect(container.textContent).toContain('4');
	});

	it('displays average transaction', () => {
		const { container } = render(HeroBalance, { props: defaultProps });
		expect(container.textContent).toContain('€50');
	});

	it('handles zero totals', () => {
		const { container } = render(HeroBalance, {
			props: { ...defaultProps, balance: 0, postings: [], totalCredit: 0, totalDebit: 0, transactionCount: 0 }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
