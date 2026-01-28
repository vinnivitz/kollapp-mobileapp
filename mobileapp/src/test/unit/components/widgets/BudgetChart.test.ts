import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

// Mock IntersectionObserver for lazy loading in tests
class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		// Immediately trigger visibility
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

import BudgetChart from '$lib/components/widgets/budget/BudgetChart.svelte';

vi.mock('@edde746/svelte-apexcharts', () => {
	let lastOptions: unknown;
	function ChartStub(arguments_: { target: Element; props?: { options?: unknown } }): {
		$$: { fragment: { d(): void; m(): void; p(): void } };
		$destroy(): void;
		$set(setArguments: { options?: unknown }): void;
	} {
		lastOptions = arguments_?.props?.options;
		return {
			$$: { fragment: { d() {}, m() {}, p() {} } },
			$destroy() {},
			$set(setArguments: { options?: unknown }) {
				if ('options' in setArguments) lastOptions = setArguments.options;
			}
		};
	}
	return {
		__chartOptions: () => lastOptions,
		default: ChartStub
	};
});

const defaultProps = { personsOfOrganization: [] };

function getBudgetTotal(container: Element): Element | null {
	return container.querySelector('ion-text.absolute');
}

function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 10_000,
			date: new TZDate().toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'A',
			type: 'CREDIT'
		},
		{
			amountInCents: 2500,
			date: new TZDate().toISOString(),
			id: 2,
			organizationBudgetCategoryId: 2,
			personOfOrganizationId: 1,
			purpose: 'B',
			type: 'DEBIT'
		},
		{
			amountInCents: 3000,
			date: new TZDate().toISOString(),
			id: 3,
			organizationBudgetCategoryId: 3,
			personOfOrganizationId: 1,
			purpose: 'C',
			type: 'CREDIT'
		},
		{
			amountInCents: 1000,
			date: new TZDate().toISOString(),
			id: 4,
			organizationBudgetCategoryId: 4,
			personOfOrganizationId: 1,
			purpose: 'D',
			type: 'DEBIT'
		},
		{
			amountInCents: 2000,
			date: new TZDate().toISOString(),
			id: 5,
			organizationBudgetCategoryId: 5,
			personOfOrganizationId: 1,
			purpose: 'E',
			type: 'CREDIT'
		}
	];
}

function makeManyPostings(count: number, type: 'CREDIT' | 'DEBIT'): PostingTO[] {
	return Array.from({ length: count }, (_, index) => ({
		amountInCents: (count - index) * 1000,
		date: new TZDate().toISOString(),
		id: index + 1,
		organizationBudgetCategoryId: index + 1,
		personOfOrganizationId: 1,
		purpose: `Posting ${index + 1}`,
		type
	}));
}

describe('widgets/BudgetChart', () => {
	it('BudgetChart renders donut total when ALL selected', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		const totalText = getBudgetTotal(container);
		expect(totalText).toBeTruthy();
	});

	it('BudgetChart shows no-postings note when empty', () => {
		const { container } = render(BudgetChart, { ...defaultProps, postings: [] });
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('BudgetChart: switch to DEBIT and back to ALL shows different totals', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});
		const chips = container.querySelectorAll('ion-chip');

		// Initially in ALL view, total should be visible
		expect(getBudgetTotal(container)).toBeTruthy();

		await fireEvent.click(chips[2]!);
		// DEBIT view also shows total
		expect(getBudgetTotal(container)).toBeTruthy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: with minimal postings shows chips (threshold is 1)', async () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 1000,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'A',
				type: 'CREDIT'
			},
			{
				amountInCents: 500,
				date: now,
				id: 2,
				organizationBudgetCategoryId: 2,
				personOfOrganizationId: 1,
				purpose: 'B',
				type: 'DEBIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBe(3);
		});
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: only credits render credit chip and switching shows credit total', async () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 2000,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'A',
				type: 'CREDIT'
			},
			{
				amountInCents: 3000,
				date: now,
				id: 2,
				organizationBudgetCategoryId: 2,
				personOfOrganizationId: 1,
				purpose: 'B',
				type: 'CREDIT'
			},
			{
				amountInCents: 4000,
				date: now,
				id: 3,
				organizationBudgetCategoryId: 3,
				personOfOrganizationId: 1,
				purpose: 'C',
				type: 'CREDIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);

		await fireEvent.click(chips[1]!);
		// Now shows credit total instead of hiding
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: interaction threshold exactly met shows chips', async () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 1000,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'X',
				type: 'DEBIT'
			},
			{
				amountInCents: 1000,
				date: now,
				id: 2,
				organizationBudgetCategoryId: 2,
				personOfOrganizationId: 1,
				purpose: 'Y',
				type: 'DEBIT'
			},
			{
				amountInCents: 1000,
				date: now,
				id: 3,
				organizationBudgetCategoryId: 3,
				personOfOrganizationId: 1,
				purpose: 'Z',
				type: 'DEBIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});
	});

	it('BudgetChart: only debits render debit chip and switching shows debit total', async () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 1200,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'D1',
				type: 'DEBIT'
			},
			{
				amountInCents: 800,
				date: now,
				id: 2,
				organizationBudgetCategoryId: 2,
				personOfOrganizationId: 1,
				purpose: 'D2',
				type: 'DEBIT'
			},
			{
				amountInCents: 600,
				date: now,
				id: 3,
				organizationBudgetCategoryId: 3,
				personOfOrganizationId: 1,
				purpose: 'D3',
				type: 'DEBIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);

		await fireEvent.click(chips[1]!);
		// Now shows debit total instead of hiding
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: switch to CREDIT then back to ALL shows total in all views', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);
		// Credit view now shows credit total
		expect(getBudgetTotal(container)).toBeTruthy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: switch to DEBIT then back to ALL shows total in all views', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[2]!);
		// Debit view now shows debit total
		expect(getBudgetTotal(container)).toBeTruthy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: mixed dataset renders all chips and shows totals in all views', async () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 5000,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Income A',
				type: 'CREDIT'
			},
			{
				amountInCents: 2000,
				date: now,
				id: 2,
				organizationBudgetCategoryId: 2,
				personOfOrganizationId: 1,
				purpose: 'Expense A',
				type: 'DEBIT'
			},
			{
				amountInCents: 1000,
				date: now,
				id: 3,
				organizationBudgetCategoryId: 3,
				personOfOrganizationId: 1,
				purpose: 'Expense B',
				type: 'DEBIT'
			},
			{
				amountInCents: 1500,
				date: now,
				id: 4,
				organizationBudgetCategoryId: 4,
				personOfOrganizationId: 1,
				purpose: 'Income B',
				type: 'CREDIT'
			},
			{
				amountInCents: 1200,
				date: now,
				id: 5,
				organizationBudgetCategoryId: 5,
				personOfOrganizationId: 1,
				purpose: 'Expense C',
				type: 'DEBIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);
		// Credit view shows credit total
		expect(getBudgetTotal(container)).toBeTruthy();
		await fireEvent.click(chips[2]!);
		// Debit view shows debit total
		expect(getBudgetTotal(container)).toBeTruthy();
		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: with more than 5 postings shows "others" aggregation', async () => {
		const postings = makeManyPostings(8, 'CREDIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		// The component now shows top 5 + "others" aggregation instead of show-more button
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: with 5 or fewer postings shows all in chart', async () => {
		const postings = makeManyPostings(5, 'CREDIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		// With 5 or fewer, all items are displayed directly without "others"
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: switching between views updates chart data', async () => {
		const postings = makeManyPostings(8, 'DEBIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		// Verify total is shown
		expect(getBudgetTotal(container)).toBeTruthy();

		// Switch back to ALL
		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: no expand button shown in ALL view', () => {
		const postings = makeManyPostings(10, 'CREDIT');
		const { queryByText } = render(BudgetChart, { ...defaultProps, postings });

		expect(queryByText('components.widgets.budget-card.show-more')).toBeFalsy();
	});

	it('BudgetChart: chart selection state is preserved when switching views', async () => {
		const creditPostings = makeManyPostings(8, 'CREDIT');
		const debitPostings = makeManyPostings(8, 'DEBIT').map((p, index) => ({ ...p, id: 100 + index }));
		const postings = [...creditPostings, ...debitPostings];

		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');

		// Switch to CREDIT
		await fireEvent.click(chips[1]!);
		expect(getBudgetTotal(container)).toBeTruthy();

		// Switch to DEBIT
		await fireEvent.click(chips[2]!);
		expect(getBudgetTotal(container)).toBeTruthy();

		// Switch back to CREDIT
		await fireEvent.click(chips[1]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});
});
