import type { ResponseBody } from '$lib/models/api';
import type { PostingCreateUpdateRequestTO } from '@kollapp/api-types';

import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PostingItem from '$lib/components/widgets/budget/PostingItem.svelte';

// Mock dependencies
vi.mock('$lib/utility', async (importOriginal) => {
	const original = await importOriginal<object>();
	return {
		...original,
		confirmationModal: vi.fn(),
		customForm: vi.fn(),
		formatter: {
			currency: (value: number) => `€${(value / 100).toFixed(2)}`
		},
		getBudgetCategoryNameById: () => 'Category',
		getPersonOfOrganizationId: () => 1,
		getUsernameByPersonOfOrganizationId: () => 'User',
		getValidationResult: vi.fn().mockReturnValue({ errors: {}, valid: true }),
		hasOrganizationRole: () => false,
		parser: {
			currency: (value: string) => Number.parseFloat(value.replace('€', '')) * 100
		},
		withLoader: vi.fn()
	};
});

const mockActivities = [
	{ activityPostings: [], date: '2024-01-01', id: 1, name: 'Activity 1' },
	{ activityPostings: [], date: '2024-02-01', id: 2, name: 'Activity 2' }
];

const mockBudgetCategories = [
	{ defaultCategory: true, id: 1, name: 'Food' },
	{ defaultCategory: false, id: 2, name: 'Transport' }
];

const mockPersonsOfOrganization = [
	{ id: 1, userId: 1, username: 'John Doe' },
	{ id: 2, userId: 2, username: 'Jane Doe' }
];

const mockCreditPosting = {
	amountInCents: 1000,
	budgetCategoryId: 1,
	date: '2024-01-15',
	description: 'Test Credit Posting',
	id: 1,
	personOfOrganizationId: 1,
	type: 'CREDIT' as const
};

const mockDebitPosting = {
	amountInCents: 500,
	budgetCategoryId: 2,
	date: '2024-01-20',
	description: 'Test Debit Posting',
	id: 2,
	personOfOrganizationId: 2,
	type: 'DEBIT' as const
};

describe('widgets/budget/PostingItem', () => {
	let onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
	let onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
	let onEditEnd: () => void;
	let onEditStart: () => void;
	let onTransferActivityPosting: (postingId: number, targetActivityId: number) => Promise<ResponseBody>;
	let onTransferOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
	let onUpdateActivityPosting: (
		postingId: number,
		activityId: number,
		model: PostingCreateUpdateRequestTO
	) => Promise<ResponseBody>;
	let onUpdateOrganizationPosting: (postingId: number, model: PostingCreateUpdateRequestTO) => Promise<ResponseBody>;
	beforeEach(() => {
		onDeleteActivityPosting = vi.fn().mockResolvedValue({});
		onDeleteOrganizationPosting = vi.fn().mockResolvedValue({});
		onEditEnd = vi.fn();
		onEditStart = vi.fn();
		onTransferActivityPosting = vi.fn().mockResolvedValue({ data: mockCreditPosting });
		onTransferOrganizationPosting = vi.fn().mockResolvedValue({ data: mockCreditPosting });
		onUpdateActivityPosting = vi.fn().mockResolvedValue({ data: mockCreditPosting });
		onUpdateOrganizationPosting = vi.fn().mockResolvedValue({ data: mockCreditPosting });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('renders credit posting', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders debit posting', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockDebitPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('displays posting amount', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			// Amount: 1000 cents = €10.00
			expect(container.textContent).toContain('€10.00');
		});

		it('displays posting date', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			// Should show date in some format
			expect(container.textContent).toContain('Jan');
		});
	});

	describe('with activity', () => {
		it('renders posting with activity context', async () => {
			const mockActivity = mockActivities[0];

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					activity: mockActivity as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('structure', () => {
		it('uses Card component', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container.querySelector('ion-card')).toBeTruthy();
		});

		it('has chip elements', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container.querySelector('ion-chip')).toBeTruthy();
		});
	});

	describe('callbacks', () => {
		it('accepts onCompleted callback', async () => {
			const onCompleted = vi.fn();

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onCompleted,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('posting types', () => {
		it('renders credit type with correct styling', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			// Credit postings should have success color
			const successElements = container.querySelectorAll('[color="success"]');
			expect(successElements.length).toBeGreaterThan(0);
		});

		it('renders debit type with correct styling', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockDebitPosting as never
				}
			});
			await tick();

			// Debit postings should have danger color
			const dangerElements = container.querySelectorAll('[color="danger"]');
			expect(dangerElements.length).toBeGreaterThan(0);
		});
	});

	describe('posting without description', () => {
		it('renders posting without description', async () => {
			const postingWithoutDescription = { ...mockCreditPosting, description: '' };

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: postingWithoutDescription as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders posting with null description', async () => {
			const postingWithNullDescription = { ...mockCreditPosting, description: undefined };

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: postingWithNullDescription as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('budget categories', () => {
		it('displays category chip', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			// Should show category name from mock
			expect(container.textContent).toContain('Category');
		});

		it('handles empty budget categories', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: [] as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('persons of organization', () => {
		it('displays user chip', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			// Should show user from mock
			expect(container.textContent).toContain('User');
		});

		it('handles empty persons list', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('activities', () => {
		it('renders with empty activities list', async () => {
			const { container } = render(PostingItem, {
				props: {
					activities: [] as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders with multiple activities', async () => {
			const moreActivities = [
				...mockActivities,
				{ activityPostings: [], date: '2024-03-01', id: 3, name: 'Activity 3' },
				{ activityPostings: [], date: '2024-04-01', id: 4, name: 'Activity 4' }
			];

			const { container } = render(PostingItem, {
				props: {
					activities: moreActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: mockCreditPosting as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('different posting amounts', () => {
		it('renders large amount posting', async () => {
			const largeAmountPosting = { ...mockCreditPosting, amountInCents: 1_000_000 };

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: largeAmountPosting as never
				}
			});
			await tick();

			// Amount: 1000000 cents = €10000.00
			expect(container.textContent).toContain('€10000.00');
		});

		it('renders small amount posting', async () => {
			const smallAmountPosting = { ...mockCreditPosting, amountInCents: 1 };

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: smallAmountPosting as never
				}
			});
			await tick();

			// Amount: 1 cent = €0.01
			expect(container.textContent).toContain('€0.01');
		});

		it('renders zero amount posting', async () => {
			const zeroAmountPosting = { ...mockCreditPosting, amountInCents: 0 };

			const { container } = render(PostingItem, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onEditEnd,
					onEditStart,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					posting: zeroAmountPosting as never
				}
			});
			await tick();

			expect(container.textContent).toContain('€0.00');
		});
	});
});
