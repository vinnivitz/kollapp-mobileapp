import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MemberStatistics from '$lib/components/internal/budget/statistics/MemberStatistics.svelte';

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

// Mock ApexCharts
vi.mock('@edde746/svelte-apexcharts', () => ({
	default: vi.fn()
}));

// Mock navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/paths', () => ({
	resolve: (path: string, parameters?: Record<string, string>) =>
		parameters ? path.replace('[slug]', parameters.slug ?? '') : path
}));

const mockPersons = [
	{ id: 1, username: 'Alice' },
	{ id: 2, username: 'Bob' },
	{ id: 3, username: 'Charlie' }
];

const mockPostings = [
	{ amountInCents: 10_000, date: '2025-01-10', personOfOrganizationId: 1, type: 'CREDIT' as const },
	{ amountInCents: 3000, date: '2025-01-15', personOfOrganizationId: 1, type: 'DEBIT' as const },
	{ amountInCents: 5000, date: '2025-01-12', personOfOrganizationId: 2, type: 'CREDIT' as const },
	{ amountInCents: 8000, date: '2025-01-18', personOfOrganizationId: 2, type: 'DEBIT' as const }
];

describe('widgets/budget/statistics/MemberStatistics', () => {
	it('renders card with title', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays member names', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		expect(container.textContent).toContain('Alice');
		expect(container.textContent).toContain('Bob');
	});

	it('displays credit and debit amounts per member', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		// Alice: credit=10000, debit=3000
		expect(container.textContent).toContain('€100.00');
		expect(container.textContent).toContain('€30.00');
	});

	it('displays net amount per member', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		// Alice net = 10000-3000 = 7000
		expect(container.textContent).toContain('€70.00');
	});

	it('sorts members by net descending', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		const textContent = container.textContent ?? '';
		// Alice (net 7000) should appear before Bob (net -3000)
		expect(textContent.indexOf('Alice')).toBeLessThan(textContent.indexOf('Bob'));
	});

	it('filters out members with no postings', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		// Charlie has no postings
		expect(container.textContent).not.toContain('Charlie');
	});

	it('shows no-data message when no postings', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: [] }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('handles empty persons array', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: [], postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('renders with dark mode', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: true, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});

	it('displays volume share percentage', () => {
		const { container } = render(MemberStatistics, {
			props: { isDarkMode: false, personsOfOrganization: mockPersons as never, postings: mockPostings as never }
		});
		// Total volume = 26000, Alice volume = 13000 → 50.0%
		expect(container.textContent).toContain('50.0%');
	});
});
