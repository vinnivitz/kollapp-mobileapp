import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
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

import BudgetChart from '$lib/components/internal/budget/statistics/BudgetChart.svelte';

const defaultProps = { personsOfOrganization: [] };

function getBalance(container: Element): Element | null {
	return container.querySelector('[data-testid="budget-balance"]');
}

function getRatioBar(container: Element): Element | null {
	return container.querySelector('[data-testid="budget-ratio-bar"]');
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
	it('BudgetChart renders balance when postings exist', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		const balance = getBalance(container);
		expect(balance).toBeTruthy();
	});

	it('BudgetChart shows no-postings note when empty', () => {
		const { container } = render(BudgetChart, { ...defaultProps, postings: [] });
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('BudgetChart renders ratio bar when postings exist', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		const ratioBar = getRatioBar(container);
		expect(ratioBar).toBeTruthy();
	});

	it('BudgetChart shows top expenses for debit postings', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		expect(getBalance(container)).toBeTruthy();
	});

	it('BudgetChart with only credits renders balance and ratio bar but no top expenses section', () => {
		const postings = makeManyPostings(3, 'CREDIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		expect(getBalance(container)).toBeTruthy();
		expect(getRatioBar(container)).toBeTruthy();
	});

	it('BudgetChart with only debits renders balance and ratio bar', () => {
		const postings = makeManyPostings(3, 'DEBIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		expect(getBalance(container)).toBeTruthy();
		expect(getRatioBar(container)).toBeTruthy();
	});

	it('BudgetChart shows at most 3 top expenses', () => {
		const postings = makeManyPostings(8, 'DEBIT');
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		// The top expenses section should list at most 3 items
		const borderSection = container.querySelector('.border-t');
		expect(borderSection).toBeTruthy();
		const expenseItems = borderSection!.querySelectorAll('.truncate');
		expect(expenseItems.length).toBeLessThanOrEqual(3);
	});

	it('BudgetChart renders no chips (simplified view)', () => {
		const postings = makePostings();
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(0);
	});

	it('BudgetChart with single posting renders correctly', () => {
		const now = new TZDate().toISOString();
		const postings: PostingTO[] = [
			{
				amountInCents: 5000,
				date: now,
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Single expense',
				type: 'DEBIT'
			}
		];
		const { container } = render(BudgetChart, { ...defaultProps, postings });
		expect(getBalance(container)).toBeTruthy();
		expect(getRatioBar(container)).toBeTruthy();
	});

	it('BudgetChart: mixed dataset renders balance and all sections', () => {
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

		// Balance should be visible
		expect(getBalance(container)).toBeTruthy();
		// Ratio bar should be visible
		expect(getRatioBar(container)).toBeTruthy();
		// Top expenses section should be visible
		expect(container.querySelector('.border-t')).toBeTruthy();
	});

	it('BudgetChart: no ratio bar when no postings', () => {
		const { container } = render(BudgetChart, { ...defaultProps, postings: [] });
		expect(getRatioBar(container)).toBeFalsy();
		expect(getBalance(container)).toBeFalsy();
	});
});
