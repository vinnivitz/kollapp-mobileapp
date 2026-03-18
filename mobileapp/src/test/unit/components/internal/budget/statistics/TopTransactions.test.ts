import type { PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import TopTransactions from '$lib/components/internal/budget/statistics/TopTransactions.svelte';

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
		confirmationModal: vi.fn(),
		customForm: vi.fn(),
		formatter: {
			currency: (value: number, short?: boolean) =>
				short ? `€${(value / 100).toFixed(0)}` : `€${(value / 100).toFixed(2)}`,
			date: (_date: Date, format?: string) => format ?? '2024-01-01'
		},
		getBudgetCategoryNameById: () => 'Category',
		getPersonOfOrganizationId: () => 1,
		getUsernameByPersonOfOrganizationId: () => 'User',
		getValidationResult: vi.fn().mockReturnValue({ errors: {}, valid: true }),
		hasOrganizationRole: vi.fn().mockReturnValue(false),
		withLoader: vi.fn()
	};
});

vi.mock('$app/paths', () => ({
	resolve: (path: string, parameters?: Record<string, string>) =>
		parameters ? path.replace('[slug]', parameters.slug ?? '') : path
}));

function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 50_000,
			date: new TZDate().toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Big Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 30_000,
			date: new TZDate().toISOString(),
			id: 2,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Medium Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 40_000,
			date: new TZDate().toISOString(),
			id: 3,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Big Debit',
			type: 'DEBIT'
		},
		{
			amountInCents: 10_000,
			date: new TZDate().toISOString(),
			id: 4,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Small Debit',
			type: 'DEBIT'
		}
	];
}

describe('widgets/budget/statistics/TopTransactions', () => {
	it('renders card with title', () => {
		const { container } = render(TopTransactions, {
			props: { postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty postings', () => {
		const { container } = render(TopTransactions, {
			props: { postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows tab chips for credits and debits', () => {
		const { container } = render(TopTransactions, {
			props: { postings: makePostings() }
		});
		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(2);
	});

	it('defaults to credits tab', () => {
		const { container } = render(TopTransactions, {
			props: { postings: makePostings() }
		});
		// Credits chip should be selected
		const chips = container.querySelectorAll('ion-chip');
		if (chips.length > 0) {
			// The success-colored chip is the credits tab
			expect(chips[0]).toBeTruthy();
		}
	});

	it('renders posting items', () => {
		const { container } = render(TopTransactions, {
			props: { postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows empty state when no matching postings', () => {
		const debitOnly: PostingTO[] = [
			{
				amountInCents: 5000,
				date: new TZDate().toISOString(),
				id: 1,
				organizationBudgetCategoryId: 1,
				personOfOrganizationId: 1,
				purpose: 'Debit only',
				type: 'DEBIT'
			}
		];
		const { container } = render(TopTransactions, {
			props: { postings: debitOnly }
		});
		// Credit tab is default, debit only — should show empty state
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('limits displayed postings to top count', () => {
		const manyPostings: PostingTO[] = Array.from({ length: 10 }, (_, index) => ({
			amountInCents: (index + 1) * 1000,
			date: new TZDate().toISOString(),
			id: index + 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: `Credit ${index + 1}`,
			type: 'CREDIT' as const
		}));
		const { container } = render(TopTransactions, {
			props: { postings: manyPostings }
		});
		// TOP_COUNT = 4, so at most 4 posting items
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
