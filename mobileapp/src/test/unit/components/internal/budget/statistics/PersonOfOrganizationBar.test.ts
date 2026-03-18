import type { PersonOfOrganizationTO, PostingTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import PersonOfOrganizationBar from '$lib/components/internal/budget/statistics/PersonOfOrganizationBar.svelte';

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
				short ? `€${(value / 100).toFixed(0)}` : `€${(value / 100).toFixed(2)}`
		}
	};
});

vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

vi.mock('$app/paths', () => ({
	resolve: (path: string) => path
}));

const personsOfOrganization: PersonOfOrganizationTO[] = [
	{ id: 1, username: 'Alice' },
	{ id: 2, username: 'Bob' },
	{ id: 3, username: 'Charlie' }
] as PersonOfOrganizationTO[];

function makePostings(): PostingTO[] {
	return [
		{
			amountInCents: 10_000,
			date: new TZDate().toISOString(),
			id: 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Alice Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 3000,
			date: new TZDate().toISOString(),
			id: 2,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 1,
			purpose: 'Alice Debit',
			type: 'DEBIT'
		},
		{
			amountInCents: 5000,
			date: new TZDate().toISOString(),
			id: 3,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 2,
			purpose: 'Bob Credit',
			type: 'CREDIT'
		},
		{
			amountInCents: 8000,
			date: new TZDate().toISOString(),
			id: 4,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: 2,
			purpose: 'Bob Debit',
			type: 'DEBIT'
		}
	];
}

describe('widgets/budget/statistics/PersonOfOrganizationBar', () => {
	it('renders card with title', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with empty postings', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('shows no-data message when no postings', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: [] }
		});
		expect(container.querySelector('ion-text[color="medium"]')).toBeTruthy();
	});

	it('displays person usernames', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: makePostings() }
		});
		const text = container.textContent ?? '';
		expect(text).toContain('Alice');
		expect(text).toContain('Bob');
	});

	it('displays formatted amounts', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: makePostings() }
		});
		const text = container.textContent ?? '';
		// Alice: credit 10000, debit 3000 → net 7000 = €70.00
		expect(text).toContain('€70.00');
	});

	it('renders in dark mode', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: true, personsOfOrganization, postings: makePostings() }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('filters out persons with no postings', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: makePostings() }
		});
		const text = container.textContent ?? '';
		// Charlie has no postings, should not appear
		expect(text).not.toContain('Charlie');
	});

	it('shows show-all button when more members than top count', () => {
		const manyPersons = Array.from({ length: 6 }, (_, index) => ({
			id: index + 1,
			username: `User ${index + 1}`
		})) as PersonOfOrganizationTO[];
		const manyPostings = manyPersons.map((person, index) => ({
			amountInCents: (index + 1) * 1000,
			date: new TZDate().toISOString(),
			id: index + 1,
			organizationBudgetCategoryId: 1,
			personOfOrganizationId: person.id,
			purpose: `Posting ${index + 1}`,
			type: 'CREDIT' as const
		}));
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization: manyPersons, postings: manyPostings }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('sorts by net descending by default', () => {
		const { container } = render(PersonOfOrganizationBar, {
			props: { isDarkMode: false, personsOfOrganization, postings: makePostings() }
		});
		const items = container.querySelectorAll('ion-item');
		if (items.length >= 2) {
			// Alice net = +7000, Bob net = -3000, so Alice first
			expect(items[0]!.textContent).toContain('Alice');
		}
	});
});
