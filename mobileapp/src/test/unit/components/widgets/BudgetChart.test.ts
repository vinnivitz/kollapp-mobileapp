import type { PostingTO } from '@kollapp/api-types';

import { fireEvent, render } from '@testing-library/svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import BudgetChart from '$lib/components/widgets/BudgetChart.svelte';

function registerMocks(): void {
	vi.mock('@edde746/svelte-apexcharts', () => ({
		default: () => ({
			$$render: () => `<div data-testid="chart-stub"></div>`
		})
	}));
}

const createPosting = (overrides: Partial<PostingTO> = {}): PostingTO => ({
	amountInCents: 10_000,
	date: '2025-01-15',
	id: 1,
	purpose: 'Test Posting',
	type: 'CREDIT',
	...overrides
});

describe('BudgetChart Component', () => {
	beforeAll(() => registerMocks());
	it('renders "No budget postings available" when postings is undefined', () => {
		const { container } = render(BudgetChart, { props: { postings: undefined } });

		const ionNote = container.querySelector('ion-note');
		expect(ionNote).toBeTruthy();
		expect(ionNote?.textContent).toContain('No budget postings available.');
	});

	it('renders "No budget postings available" when postings is empty array', () => {
		const { container } = render(BudgetChart, { props: { postings: [] } });

		const ionNote = container.querySelector('ion-note');
		expect(ionNote).toBeTruthy();
		expect(ionNote?.textContent).toContain('No budget postings available.');
	});

	it('renders "Budget overview" title', () => {
		const postings = [createPosting()];
		const { container } = render(BudgetChart, { props: { postings } });

		const title = container.querySelector('.text-2xl');
		expect(title?.textContent).toContain('Budget overview');
	});

	it('renders chart when postings are provided', () => {
		const postings = [createPosting({ id: 1, type: 'CREDIT' }), createPosting({ id: 2, type: 'DEBIT' })];
		const { container } = render(BudgetChart, { props: { postings } });

		const chart = container.querySelector(String.raw`.h-\[350px\]`);
		expect(chart).toBeTruthy();
	});

	it('renders "All" chip when postings are provided', () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' }),
			createPosting({ id: 4, type: 'DEBIT' }),
			createPosting({ id: 5, type: 'DEBIT' }),
			createPosting({ id: 6, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const allChip = [...chips].find((chip) => chip.textContent?.includes('All'));

		expect(allChip).toBeTruthy();
	});

	it('renders "Income" chip when there are more than 2 credit postings', () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));

		expect(incomeChip).toBeTruthy();
	});

	it('does not render "Income" chip when there are 2 or fewer credit postings', () => {
		const postings = [createPosting({ id: 1, type: 'CREDIT' }), createPosting({ id: 2, type: 'CREDIT' })];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));

		expect(incomeChip).toBeFalsy();
	});

	it('renders "Expenses" chip when there are more than 2 debit postings', () => {
		const postings = [
			createPosting({ id: 1, type: 'DEBIT' }),
			createPosting({ id: 2, type: 'DEBIT' }),
			createPosting({ id: 3, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

		expect(expensesChip).toBeTruthy();
	});

	it('does not render "Expenses" chip when there are 2 or fewer debit postings', () => {
		const postings = [createPosting({ id: 1, type: 'DEBIT' }), createPosting({ id: 2, type: 'DEBIT' })];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

		expect(expensesChip).toBeFalsy();
	});

	it('renders both Income and Expenses chips when there are sufficient postings of both types', () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' }),
			createPosting({ id: 4, type: 'DEBIT' }),
			createPosting({ id: 5, type: 'DEBIT' }),
			createPosting({ id: 6, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

		expect(incomeChip).toBeTruthy();
		expect(expensesChip).toBeTruthy();
	});

	it('renders total budget in the center when chart type is ALL', () => {
		const postings = [
			createPosting({ amountInCents: 50_000, id: 1, type: 'CREDIT' }),
			createPosting({ amountInCents: 20_000, id: 2, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeTruthy();
		expect(budgetText?.textContent).toContain('300');
	});

	it('calculates total budget correctly (credits - debits)', () => {
		const postings = [
			createPosting({ amountInCents: 100_000, id: 1, type: 'CREDIT' }),
			createPosting({ amountInCents: 150_000, id: 2, type: 'CREDIT' }),
			createPosting({ amountInCents: 75_000, id: 3, type: 'DEBIT' }),
			createPosting({ amountInCents: 25_000, id: 4, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText?.textContent).toContain('1.500');
	});

	it('handles negative budget correctly', () => {
		const postings = [
			createPosting({ amountInCents: 50_000, id: 1, type: 'CREDIT' }),
			createPosting({ amountInCents: 100_000, id: 2, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText?.textContent).toContain('-500');
	});

	it('switches to Income view when Income chip is clicked', async () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;

		expect(incomeChip).toBeTruthy();

		await fireEvent.click(incomeChip);

		expect(incomeChip.getAttribute('outline')).toBe('false');
	});

	it('switches to Expenses view when Expenses chip is clicked', async () => {
		const postings = [
			createPosting({ id: 1, type: 'DEBIT' }),
			createPosting({ id: 2, type: 'DEBIT' }),
			createPosting({ id: 3, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses')) as HTMLIonChipElement;

		expect(expensesChip).toBeTruthy();

		await fireEvent.click(expensesChip);

		expect(expensesChip.getAttribute('outline')).toBe('false');
	});

	it('switches back to All view when All chip is clicked', async () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' }),
			createPosting({ id: 4, type: 'DEBIT' }),
			createPosting({ id: 5, type: 'DEBIT' }),
			createPosting({ id: 6, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;
		const allChip = [...chips].find((chip) => chip.textContent?.includes('All')) as HTMLIonChipElement;

		await fireEvent.click(incomeChip);

		await fireEvent.click(allChip);
		expect(allChip.getAttribute('outline')).toBe('false');
	});

	it('hides budget total when not in ALL view', async () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;

		await fireEvent.click(incomeChip);

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeFalsy();
	});

	it('handles Enter key on chips', async () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;

		expect(incomeChip).toBeTruthy();

		await fireEvent.keyDown(incomeChip, { key: 'Enter' });

		expect(incomeChip.getAttribute('outline')).toBe('false');
	});

	it('does not render chips when there are insufficient credits and debits', () => {
		const postings = [createPosting({ id: 1, type: 'CREDIT' }), createPosting({ id: 2, type: 'DEBIT' })];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		expect(chips.length).toBe(0);
	});

	it('renders chart container with correct height class', () => {
		const postings = [createPosting()];
		const { container } = render(BudgetChart, { props: { postings } });

		const chartContainer = container.querySelector(String.raw`.h-\[350px\]`);
		expect(chartContainer).toBeTruthy();
		expect(chartContainer?.classList.contains('relative')).toBe(true);
	});

	it('renders with only credit postings', () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		expect(container.querySelector('.text-2xl')).toBeTruthy();
	});

	it('renders with only debit postings', () => {
		const postings = [
			createPosting({ id: 1, type: 'DEBIT' }),
			createPosting({ id: 2, type: 'DEBIT' }),
			createPosting({ id: 3, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		expect(container.querySelector('.text-2xl')).toBeTruthy();
	});

	it('handles mixed postings with various amounts', () => {
		const postings = [
			createPosting({ amountInCents: 1000, id: 1, purpose: 'Salary', type: 'CREDIT' }),
			createPosting({ amountInCents: 2000, id: 2, purpose: 'Bonus', type: 'CREDIT' }),
			createPosting({ amountInCents: 3000, id: 3, purpose: 'Freelance', type: 'CREDIT' }),
			createPosting({ amountInCents: 500, id: 4, purpose: 'Rent', type: 'DEBIT' }),
			createPosting({ amountInCents: 300, id: 5, purpose: 'Groceries', type: 'DEBIT' }),
			createPosting({ amountInCents: 200, id: 6, purpose: 'Transport', type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeTruthy();
		// (1000 + 2000 + 3000) - (500 + 300 + 200) = 6000 - 1000 = 5000 cents = 50
		expect(budgetText?.textContent).toContain('50');
	});

	it('switches between all chart types successfully', async () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' }),
			createPosting({ id: 4, type: 'DEBIT' }),
			createPosting({ id: 5, type: 'DEBIT' }),
			createPosting({ id: 6, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const allChip = [...chips].find((chip) => chip.textContent?.includes('All')) as HTMLIonChipElement;
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses')) as HTMLIonChipElement;

		// Start with All selected
		expect(allChip.getAttribute('outline')).toBe('false');

		// Switch to Income
		await fireEvent.click(incomeChip);
		expect(incomeChip.getAttribute('outline')).toBe('false');

		// Switch to Expenses
		await fireEvent.click(expensesChip);
		expect(expensesChip.getAttribute('outline')).toBe('false');

		// Switch back to All
		await fireEvent.click(allChip);
		expect(allChip.getAttribute('outline')).toBe('false');
	});

	it('handles postings with different dates', () => {
		const postings = [
			createPosting({ date: '2025-01-15', id: 1, type: 'CREDIT' }),
			createPosting({ date: '2025-02-20', id: 2, type: 'CREDIT' }),
			createPosting({ date: '2025-03-10', id: 3, type: 'CREDIT' }),
			createPosting({ date: '2025-01-25', id: 4, type: 'DEBIT' }),
			createPosting({ date: '2025-02-15', id: 5, type: 'DEBIT' }),
			createPosting({ date: '2025-03-05', id: 6, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		expect(container.querySelector('.text-2xl')).toBeTruthy();
		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeTruthy();
	});

	it('handles postings with different purposes', () => {
		const postings = [
			createPosting({ id: 1, purpose: 'Monthly Salary', type: 'CREDIT' }),
			createPosting({ id: 2, purpose: 'Bonus Payment', type: 'CREDIT' }),
			createPosting({ id: 3, purpose: 'Investment Return', type: 'CREDIT' }),
			createPosting({ id: 4, purpose: 'Office Rent', type: 'DEBIT' }),
			createPosting({ id: 5, purpose: 'Equipment Purchase', type: 'DEBIT' }),
			createPosting({ id: 6, purpose: 'Utilities', type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		expect(container.querySelector('.text-2xl')).toBeTruthy();
	});

	it('renders correctly when exactly 3 credits exist (boundary case)', () => {
		const postings = [
			createPosting({ id: 1, type: 'CREDIT' }),
			createPosting({ id: 2, type: 'CREDIT' }),
			createPosting({ id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));

		expect(incomeChip).toBeTruthy();
	});

	it('renders correctly when exactly 3 debits exist (boundary case)', () => {
		const postings = [
			createPosting({ id: 1, type: 'DEBIT' }),
			createPosting({ id: 2, type: 'DEBIT' }),
			createPosting({ id: 3, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const chips = container.querySelectorAll('ion-chip');
		const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

		expect(expensesChip).toBeTruthy();
	});

	it('displays budget when chart has sufficient credits but no debits', () => {
		const postings = [
			createPosting({ amountInCents: 100_000, id: 1, type: 'CREDIT' }),
			createPosting({ amountInCents: 50_000, id: 2, type: 'CREDIT' }),
			createPosting({ amountInCents: 75_000, id: 3, type: 'CREDIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeTruthy();
		// 100000 + 50000 + 75000 = 225000 cents = 2250
		expect(budgetText?.textContent).toContain('2.250');
	});

	it('displays negative budget when debits exceed credits', () => {
		const postings = [
			createPosting({ amountInCents: 25_000, id: 1, type: 'CREDIT' }),
			createPosting({ amountInCents: 50_000, id: 2, type: 'DEBIT' }),
			createPosting({ amountInCents: 30_000, id: 3, type: 'DEBIT' })
		];
		const { container } = render(BudgetChart, { props: { postings } });

		const budgetText = container.querySelector('ion-text.absolute');
		expect(budgetText).toBeTruthy();
		// 25000 - (50000 + 30000) = 25000 - 80000 = -55000 cents = -550
		expect(budgetText?.textContent).toContain('-550');
	});

	describe('Additional coverage tests', () => {
		it('renders chart with very large amounts', () => {
			const postings = [
				createPosting({ amountInCents: 100_000_000, id: 1, type: 'CREDIT' }),
				createPosting({ amountInCents: 50_000_000, id: 2, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
			// 100000000 - 50000000 = 50000000 cents = 500000
			expect(budgetText?.textContent).toContain('500.000');
		});

		it('renders correctly with postings that have very long purposes', () => {
			const postings = [
				createPosting({ id: 1, purpose: 'A'.repeat(100), type: 'CREDIT' }),
				createPosting({ id: 2, purpose: 'B'.repeat(100), type: 'CREDIT' }),
				createPosting({ id: 3, purpose: 'C'.repeat(100), type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			expect(container.querySelector('.text-2xl')).toBeTruthy();
		});

		it('handles edge case: single CREDIT posting', () => {
			const postings = [createPosting({ amountInCents: 50_000, id: 1, type: 'CREDIT' })];
			const { container } = render(BudgetChart, { props: { postings } });

			// No chips should be shown (insufficient postings)
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBe(0);

			// But budget should still be displayed
			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
			expect(budgetText?.textContent).toContain('500');
		});

		it('handles edge case: single DEBIT posting', () => {
			const postings = [createPosting({ amountInCents: 50_000, id: 1, type: 'DEBIT' })];
			const { container } = render(BudgetChart, { props: { postings } });

			// No chips should be shown (insufficient postings)
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBe(0);

			// But budget should still be displayed
			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
			expect(budgetText?.textContent).toContain('-500');
		});

		it('renders chart when switching from Income to Expenses', async () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'CREDIT' }),
				createPosting({ id: 3, type: 'CREDIT' }),
				createPosting({ id: 4, type: 'DEBIT' }),
				createPosting({ id: 5, type: 'DEBIT' }),
				createPosting({ id: 6, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;
			const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses')) as HTMLIonChipElement;

			// Switch to Income
			await fireEvent.click(incomeChip);
			expect(incomeChip.getAttribute('outline')).toBe('false');

			// Switch to Expenses
			await fireEvent.click(expensesChip);
			expect(expensesChip.getAttribute('outline')).toBe('false');
			expect(incomeChip.getAttribute('outline')).toBe('true');
		});

		it('maintains chart container throughout view changes', async () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'CREDIT' }),
				createPosting({ id: 3, type: 'CREDIT' }),
				createPosting({ id: 4, type: 'DEBIT' }),
				createPosting({ id: 5, type: 'DEBIT' }),
				createPosting({ id: 6, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			// Check initial state
			let chartContainer = container.querySelector(String.raw`.h-\[350px\]`);
			expect(chartContainer).toBeTruthy();

			// Switch views and verify chart container persists
			const chips = container.querySelectorAll('ion-chip');
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;

			await fireEvent.click(incomeChip);

			chartContainer = container.querySelector(String.raw`.h-\[350px\]`);
			expect(chartContainer).toBeTruthy();
		});

		it('handles postings with future dates', () => {
			const postings = [
				createPosting({ date: '2030-01-01', id: 1, type: 'CREDIT' }),
				createPosting({ date: '2030-12-31', id: 2, type: 'CREDIT' }),
				createPosting({ date: '2030-06-15', id: 3, type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			expect(container.querySelector('.text-2xl')).toBeTruthy();
		});

		it('handles postings with past dates', () => {
			const postings = [
				createPosting({ date: '2020-01-01', id: 1, type: 'DEBIT' }),
				createPosting({ date: '2020-12-31', id: 2, type: 'DEBIT' }),
				createPosting({ date: '2020-06-15', id: 3, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			expect(container.querySelector('.text-2xl')).toBeTruthy();
		});

		it('handles exactly 2 credits (boundary)', () => {
			const postings = [createPosting({ id: 1, type: 'CREDIT' }), createPosting({ id: 2, type: 'CREDIT' })];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));
			expect(incomeChip).toBeFalsy();
		});

		it('handles exactly 2 debits (boundary)', () => {
			const postings = [createPosting({ id: 1, type: 'DEBIT' }), createPosting({ id: 2, type: 'DEBIT' })];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));
			expect(expensesChip).toBeFalsy();
		});

		it('handles mixed dates (some past, some future)', () => {
			const postings = [
				createPosting({ date: '2020-01-01', id: 1, type: 'CREDIT' }),
				createPosting({ date: '2030-01-01', id: 2, type: 'CREDIT' }),
				createPosting({ date: '2025-06-15', id: 3, type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			expect(container.querySelector('.text-2xl')).toBeTruthy();
		});

		it('handles zero budget (equal credits and debits)', () => {
			const postings = [
				createPosting({ amountInCents: 100_000, id: 1, type: 'CREDIT' }),
				createPosting({ amountInCents: 100_000, id: 2, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			// No chips when both are <= 2
			const chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBe(0);

			// But budget should still be displayed showing 0
			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
		});

		it('renders only All chip when there are sufficient credits but insufficient debits', () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'CREDIT' }),
				createPosting({ id: 3, type: 'CREDIT' }),
				createPosting({ id: 4, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const allChip = [...chips].find((chip) => chip.textContent?.includes('All'));
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));
			const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

			expect(allChip).toBeTruthy();
			expect(incomeChip).toBeTruthy();
			expect(expensesChip).toBeFalsy();
		});

		it('renders only All chip when there are insufficient credits but sufficient debits', () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'DEBIT' }),
				createPosting({ id: 3, type: 'DEBIT' }),
				createPosting({ id: 4, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const allChip = [...chips].find((chip) => chip.textContent?.includes('All'));
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));
			const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses'));

			expect(allChip).toBeTruthy();
			expect(incomeChip).toBeFalsy();
			expect(expensesChip).toBeTruthy();
		});

		it('handles postings with special characters in purpose', () => {
			const postings = [
				createPosting({ id: 1, purpose: 'Salary & Bonus', type: 'CREDIT' }),
				createPosting({ id: 2, purpose: 'Rent <Monthly>', type: 'CREDIT' }),
				createPosting({ id: 3, purpose: 'Groceries "Fresh"', type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			expect(container.querySelector('.text-2xl')).toBeTruthy();
		});

		it('handles many postings of same type', () => {
			const postings = Array.from({ length: 50 }, (_, index) => createPosting({ id: index + 1, type: 'CREDIT' }));
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income'));
			expect(incomeChip).toBeTruthy();
		});

		it('handles rapid chip switching', async () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'CREDIT' }),
				createPosting({ id: 3, type: 'CREDIT' }),
				createPosting({ id: 4, type: 'DEBIT' }),
				createPosting({ id: 5, type: 'DEBIT' }),
				createPosting({ id: 6, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const allChip = [...chips].find((chip) => chip.textContent?.includes('All')) as HTMLIonChipElement;
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;
			const expensesChip = [...chips].find((chip) => chip.textContent?.includes('Expenses')) as HTMLIonChipElement;

			// Rapid switching
			await fireEvent.click(incomeChip);
			await fireEvent.click(expensesChip);
			await fireEvent.click(allChip);
			await fireEvent.click(incomeChip);

			expect(incomeChip.getAttribute('outline')).toBe('false');
		});

		it('handles keyboard navigation with Space key on chips', async () => {
			const postings = [
				createPosting({ id: 1, type: 'CREDIT' }),
				createPosting({ id: 2, type: 'CREDIT' }),
				createPosting({ id: 3, type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const chips = container.querySelectorAll('ion-chip');
			const incomeChip = [...chips].find((chip) => chip.textContent?.includes('Income')) as HTMLIonChipElement;

			// Space key should not trigger chip (only Enter should)
			await fireEvent.keyDown(incomeChip, { key: ' ' });

			// Should still be in All view
			const allChip = [...chips].find((chip) => chip.textContent?.includes('All')) as HTMLIonChipElement;
			expect(allChip.getAttribute('outline')).toBe('false');
		});

		it('renders budget with very small amounts', () => {
			const postings = [
				createPosting({ amountInCents: 1, id: 1, type: 'CREDIT' }),
				createPosting({ amountInCents: 2, id: 2, type: 'CREDIT' }),
				createPosting({ amountInCents: 3, id: 3, type: 'CREDIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
			// 1 + 2 + 3 = 6 cents = 0.06 or could be displayed as 0.06
			const text = budgetText?.textContent || '';
			expect(text).toMatch(/0[.,]0/);
		});

		it('displays correct budget format with exact cent values', () => {
			const postings = [
				createPosting({ amountInCents: 12_345, id: 1, type: 'CREDIT' }),
				createPosting({ amountInCents: 6789, id: 2, type: 'DEBIT' })
			];
			const { container } = render(BudgetChart, { props: { postings } });

			const budgetText = container.querySelector('ion-text.absolute');
			expect(budgetText).toBeTruthy();
			// 12345 - 6789 = 5556 cents = 55.56
			const text = budgetText?.textContent || '';
			expect(text).toMatch(/55[.,]5/);
		});

		it('handles postings array changes reactively', async () => {
			const { container, rerender } = render(BudgetChart, {
				props: { postings: [createPosting({ id: 1, type: 'CREDIT' })] }
			});

			// Initially no chips (only 1 posting)
			let chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBe(0);

			// Update with more postings
			await rerender({
				postings: [
					createPosting({ id: 1, type: 'CREDIT' }),
					createPosting({ id: 2, type: 'CREDIT' }),
					createPosting({ id: 3, type: 'CREDIT' })
				]
			});

			// Should now have chips
			chips = container.querySelectorAll('ion-chip');
			expect(chips.length).toBeGreaterThan(0);
		});
	});
});
