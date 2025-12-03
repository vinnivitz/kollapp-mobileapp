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

function makePostings(): PostingTO[] {
	return [
		{ amountInCents: 10_000, date: new Date().toISOString(), id: 1, purpose: 'A', type: 'CREDIT' },
		{ amountInCents: 2500, date: new Date().toISOString(), id: 2, purpose: 'B', type: 'DEBIT' },
		{ amountInCents: 3000, date: new Date().toISOString(), id: 3, purpose: 'C', type: 'CREDIT' },
		{ amountInCents: 1000, date: new Date().toISOString(), id: 4, purpose: 'D', type: 'DEBIT' },
		{ amountInCents: 2000, date: new Date().toISOString(), id: 5, purpose: 'E', type: 'CREDIT' }
	];
}

describe('widgets/BudgetChart', () => {
	it('BudgetChart renders donut total when ALL selected', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { postings });
		const totalText = container.querySelector('ion-text');
		expect(totalText).toBeTruthy();
	});

	it('BudgetChart shows no-postings note when empty', () => {
		const { container } = render(BudgetChart, { postings: [] });
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('BudgetChart: switch to DEBIT and back to ALL', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});
		const chips = container.querySelectorAll('ion-chip');

		await fireEvent.click(chips[2]!);
		expect(container.querySelector('ion-text')).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(container.querySelector('ion-text')).toBeTruthy();
	});

	it('BudgetChart: below interaction threshold renders no chips', () => {
		const now = new Date().toISOString();
		const postings: PostingTO[] = [
			{ amountInCents: 1000, date: now, id: 1, purpose: 'A', type: 'CREDIT' },
			{ amountInCents: 500, date: now, id: 2, purpose: 'B', type: 'DEBIT' }
		];
		const { container } = render(BudgetChart, { postings });
		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(0);
		expect(container.querySelector('ion-text')).toBeTruthy();
	});

	it('BudgetChart: only credits render credit chip and switching hides total', async () => {
		const now = new Date().toISOString();
		const postings: PostingTO[] = [
			{ amountInCents: 2000, date: now, id: 1, purpose: 'A', type: 'CREDIT' },
			{ amountInCents: 3000, date: now, id: 2, purpose: 'B', type: 'CREDIT' },
			{ amountInCents: 4000, date: now, id: 3, purpose: 'C', type: 'CREDIT' }
		];
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);

		await fireEvent.click(chips[1]!);
		expect(container.querySelector('ion-text')).toBeFalsy();
	});

	it('BudgetChart: interaction threshold exactly met shows chips', async () => {
		const now = new Date().toISOString();
		const postings: PostingTO[] = [
			{ amountInCents: 1000, date: now, id: 1, purpose: 'X', type: 'DEBIT' },
			{ amountInCents: 1000, date: now, id: 2, purpose: 'Y', type: 'DEBIT' },
			{ amountInCents: 1000, date: now, id: 3, purpose: 'Z', type: 'DEBIT' }
		];
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});
	});

	it('BudgetChart: only debits render debit chip and switching hides total', async () => {
		const now = new Date().toISOString();
		const postings: PostingTO[] = [
			{ amountInCents: 1200, date: now, id: 1, purpose: 'D1', type: 'DEBIT' },
			{ amountInCents: 800, date: now, id: 2, purpose: 'D2', type: 'DEBIT' },
			{ amountInCents: 600, date: now, id: 3, purpose: 'D3', type: 'DEBIT' }
		];
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});

		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);

		await fireEvent.click(chips[1]!);
		expect(container.querySelector('ion-text')).toBeFalsy();
	});

	it('BudgetChart: switch to CREDIT then back to ALL shows total again', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);
		expect(container.querySelector('ion-text')).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(container.querySelector('ion-text')).toBeTruthy();
	});

	it('BudgetChart: switch to DEBIT then back to ALL shows total again', async () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[2]!);
		expect(container.querySelector('ion-text')).toBeFalsy();

		await fireEvent.click(chips[0]!);
		expect(container.querySelector('ion-text')).toBeTruthy();
	});

	it('BudgetChart: mixed dataset renders all chips and toggles appropriately', async () => {
		const now = new Date().toISOString();
		const postings: PostingTO[] = [
			{ amountInCents: 5000, date: now, id: 1, purpose: 'Income A', type: 'CREDIT' },
			{ amountInCents: 2000, date: now, id: 2, purpose: 'Expense A', type: 'DEBIT' },
			{ amountInCents: 1000, date: now, id: 3, purpose: 'Expense B', type: 'DEBIT' },
			{ amountInCents: 1500, date: now, id: 4, purpose: 'Income B', type: 'CREDIT' },
			{ amountInCents: 1200, date: now, id: 5, purpose: 'Expense C', type: 'DEBIT' }
		];
		const { container } = render(BudgetChart, { postings });

		await waitFor(() => {
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThanOrEqual(3);
		});

		const chips = container.querySelectorAll('ion-chip');
		await fireEvent.click(chips[1]!);
		expect(container.querySelector('ion-text')).toBeFalsy();
		await fireEvent.click(chips[2]!);
		expect(container.querySelector('ion-text')).toBeFalsy();
		await fireEvent.click(chips[0]!);
		expect(container.querySelector('ion-text')).toBeTruthy();
	});
});
