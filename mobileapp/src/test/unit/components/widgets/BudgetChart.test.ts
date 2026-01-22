import type { PostingTO } from '@kollapp/api-types';

import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import BudgetChart from '$lib/components/widgets/BudgetChart.svelte';

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
			date: new Date().toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'A',
			type: 'CREDIT'
		},
		{
			amountInCents: 2500,
			date: new Date().toISOString(),
			id: 2,
			organizationBudgetCategoryId: 2,
			personOfOrganizationId: 1,
			purpose: 'B',
			type: 'DEBIT'
		},
		{
			amountInCents: 3000,
			date: new Date().toISOString(),
			id: 3,
			organizationBudgetCategoryId: 3,
			personOfOrganizationId: 1,
			purpose: 'C',
			type: 'CREDIT'
		},
		{
			amountInCents: 1000,
			date: new Date().toISOString(),
			id: 4,
			organizationBudgetCategoryId: 4,
			personOfOrganizationId: 1,
			purpose: 'D',
			type: 'DEBIT'
		},
		{
			amountInCents: 2000,
			date: new Date().toISOString(),
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
		date: new Date().toISOString(),
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

	it('BudgetChart: switch to DEBIT and back to ALL', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});
		const chips = container.querySelectorAll('ion-chip');

		await fireEvent.click(chips[2]!);
		expect(getBudgetTotal(container)).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: with minimal postings shows chips (threshold is 1)', async () => {
		const now = new Date().toISOString();
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

	it('BudgetChart: only credits render credit chip and switching hides total', async () => {
		const now = new Date().toISOString();
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
		expect(getBudgetTotal(container)).toBeFalsy();
	});

	it('BudgetChart: interaction threshold exactly met shows chips', async () => {
		const now = new Date().toISOString();
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

	it('BudgetChart: only debits render debit chip and switching hides total', async () => {
		const now = new Date().toISOString();
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
		expect(getBudgetTotal(container)).toBeFalsy();
	});

	it('BudgetChart: switch to CREDIT then back to ALL shows total again', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);
		expect(getBudgetTotal(container)).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: switch to DEBIT then back to ALL shows total again', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[2]!);
		expect(getBudgetTotal(container)).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: mixed dataset renders all chips and toggles appropriately', async () => {
		const now = new Date().toISOString();
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
		expect(getBudgetTotal(container)).toBeFalsy();
		await fireEvent.click(chips[2]!);
		expect(getBudgetTotal(container)).toBeFalsy();
		await fireEvent.click(chips[0]!);
		expect(getBudgetTotal(container)).toBeTruthy();
	});

	it('BudgetChart: shows expand button when more than 5 postings of same type', async () => {
		const postings = makeManyPostings(8, 'CREDIT');
		const { container, getByText } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		await waitFor(() => {
			expect(getByText('components.widgets.budget-card.show-more')).toBeTruthy();
		});
	});

	it('BudgetChart: does not show expand button when 5 or fewer postings', async () => {
		const postings = makeManyPostings(5, 'CREDIT');
		const { container, queryByText } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		expect(queryByText('components.widgets.budget-card.show-more')).toBeFalsy();
	});

	it('BudgetChart: expand button toggles between show-more and show-less', async () => {
		const postings = makeManyPostings(8, 'DEBIT');
		const { container, getByText, queryByText } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);

		const showMoreButton = getByText('components.widgets.budget-card.show-more');
		await fireEvent.click(showMoreButton.closest('ion-button')!);

		await waitFor(() => {
			expect(getByText('components.widgets.budget-card.show-less')).toBeTruthy();
		});

		const showLessButton = getByText('components.widgets.budget-card.show-less');
		await fireEvent.click(showLessButton.closest('ion-button')!);

		await waitFor(() => {
			expect(queryByText('components.widgets.budget-card.show-more')).toBeTruthy();
		});
	});

	it('BudgetChart: no expand button shown in ALL view', () => {
		const postings = makeManyPostings(10, 'CREDIT');
		const { queryByText } = render(BudgetChart, { ...defaultProps, postings });

		expect(queryByText('components.widgets.budget-card.show-more')).toBeFalsy();
	});

	it('BudgetChart: expand state is preserved per chart type', async () => {
		const creditPostings = makeManyPostings(8, 'CREDIT');
		const debitPostings = makeManyPostings(8, 'DEBIT').map((p, index) => ({ ...p, id: 100 + index }));
		const postings = [...creditPostings, ...debitPostings];

		const { container, getByText, queryByText } = render(BudgetChart, { ...defaultProps, postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');

		// Switch to CREDIT and expand
		await fireEvent.click(chips[1]!);
		const showMoreButton = getByText('components.widgets.budget-card.show-more');
		await fireEvent.click(showMoreButton.closest('ion-button')!);

		await waitFor(() => {
			expect(getByText('components.widgets.budget-card.show-less')).toBeTruthy();
		});

		// Switch to DEBIT - should show "show-more" (not expanded)
		await fireEvent.click(chips[2]!);
		await waitFor(() => {
			expect(queryByText('components.widgets.budget-card.show-more')).toBeTruthy();
		});

		// Switch back to CREDIT - should still be expanded
		await fireEvent.click(chips[1]!);
		await waitFor(() => {
			expect(getByText('components.widgets.budget-card.show-less')).toBeTruthy();
		});
	});
});
