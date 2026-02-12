import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import StatisticItem from '$lib/components/internal/budget/statistics/StatisticItem.svelte';

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

describe('widgets/budget/statistics/StatisticItem', () => {
	it('renders label text', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Food', total: 5000 }
		});
		expect(container.textContent).toContain('Food');
	});

	it('displays formatted credit amount with plus sign', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Category', total: 5000 }
		});
		const successTexts = container.querySelectorAll('ion-text[color="success"]');
		const creditText = [...successTexts].find((element) => element.textContent?.includes('+'));
		expect(creditText).toBeTruthy();
		expect(creditText!.textContent).toContain('+€100.00');
	});

	it('displays formatted debit amount with minus sign', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Category', total: 5000 }
		});
		const dangerTexts = container.querySelectorAll('ion-text[color="danger"]');
		const debitText = [...dangerTexts].find((element) => element.textContent?.includes('-'));
		expect(debitText).toBeTruthy();
		expect(debitText!.textContent).toContain('-€50.00');
	});

	it('displays formatted total amount', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Category', total: 5000 }
		});
		const boldText = container.querySelector('ion-text.font-bold');
		expect(boldText).toBeTruthy();
		expect(boldText!.textContent).toContain('€50.00');
	});

	it('shows success color for positive total', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 3000, label: 'Category', total: 7000 }
		});
		const boldText = container.querySelector('ion-text.font-bold');
		expect(boldText).toBeTruthy();
		expect(boldText!.getAttribute('color')).toBe('success');
	});

	it('shows danger color for negative total', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 3000, debit: 10_000, label: 'Category', total: -7000 }
		});
		const boldText = container.querySelector('ion-text.font-bold');
		expect(boldText).toBeTruthy();
		expect(boldText!.getAttribute('color')).toBe('danger');
	});

	it('shows success color when total is zero', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 5000, debit: 5000, label: 'Category', total: 0 }
		});
		const boldText = container.querySelector('ion-text.font-bold');
		expect(boldText).toBeTruthy();
		expect(boldText!.getAttribute('color')).toBe('success');
	});

	it('displays note when provided', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Category', note: '25% share', total: 5000 }
		});
		const note = container.querySelector('ion-note');
		expect(note).toBeTruthy();
		expect(note!.textContent).toContain('25% share');
	});

	it('does not display note when not provided', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 10_000, debit: 5000, label: 'Category', total: 5000 }
		});
		const note = container.querySelector('ion-note');
		expect(note).toBeFalsy();
	});

	it('renders with zero credit and debit', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 0, debit: 0, label: 'Empty', total: 0 }
		});
		expect(container.textContent).toContain('Empty');
		expect(container.textContent).toContain('+€0.00');
		expect(container.textContent).toContain('-€0.00');
	});

	it('truncates long label text', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 1000, debit: 500, label: 'Very Long Category Name That Should Be Truncated', total: 500 }
		});
		const truncatedElement = container.querySelector('.truncate');
		expect(truncatedElement).toBeTruthy();
		expect(truncatedElement!.textContent).toContain('Very Long Category Name That Should Be Truncated');
	});

	it('renders large monetary values correctly', () => {
		const { container } = render(StatisticItem, {
			props: { credit: 1_000_000, debit: 500_000, label: 'Big Budget', total: 500_000 }
		});
		expect(container.textContent).toContain('+€10000.00');
		expect(container.textContent).toContain('-€5000.00');
	});
});
