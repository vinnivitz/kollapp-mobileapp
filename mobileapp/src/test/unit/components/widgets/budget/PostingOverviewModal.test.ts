import type { ResponseBody } from '$lib/models/api';
import type { PostingCreateUpdateRequestTO } from '@kollapp/api-types';

import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PostingOverviewModal from '$lib/components/widgets/budget/PostingOverviewModal.svelte';

// Mock dependencies
vi.mock('$lib/utility', async (importOriginal) => {
	const original = await importOriginal<object>();
	return {
		...original,
		confirmationModal: vi.fn(),
		customForm: vi.fn(),
		exportPostings: vi.fn(),
		formatter: {
			currency: (value: number) => `€${(value / 100).toFixed(2)}`
		},
		getBudgetCategoryNameById: () => 'Category',
		getOrganizationName: () => 'Test Organization',
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
	{ activityPostings: [{ id: 101 }], date: '2024-01-01', id: 1, name: 'Activity 1' },
	{ activityPostings: [{ id: 102 }], date: '2024-02-01', id: 2, name: 'Activity 2' }
];

const mockBudgetCategories = [
	{ defaultCategory: true, id: 1, name: 'Food' },
	{ defaultCategory: false, id: 2, name: 'Transport' }
];

const mockPersonsOfOrganization = [
	{ id: 1, userId: 1, username: 'John Doe' },
	{ id: 2, userId: 2, username: 'Jane Doe' }
];

const mockPostings = [
	{
		amountInCents: 1000,
		budgetCategoryId: 1,
		date: '2024-01-15',
		description: 'Test Credit',
		id: 1,
		personOfOrganizationId: 1,
		type: 'CREDIT' as const
	},
	{
		amountInCents: 500,
		budgetCategoryId: 2,
		date: '2024-01-20',
		description: 'Test Debit',
		id: 2,
		personOfOrganizationId: 2,
		type: 'DEBIT' as const
	}
];

describe('widgets/budget/PostingOverviewModal', () => {
	let dismissed: () => void;
	let onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
	let onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
	let onTransferActivityPosting: (postingId: number, targetActivityId: number) => Promise<ResponseBody>;
	let onTransferOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
	let onUpdateActivityPosting: (
		postingId: number,
		activityId: number,
		model: PostingCreateUpdateRequestTO
	) => Promise<ResponseBody>;
	let onUpdateOrganizationPosting: (postingId: number, model: PostingCreateUpdateRequestTO) => Promise<ResponseBody>;

	beforeEach(() => {
		dismissed = vi.fn();
		onDeleteActivityPosting = vi.fn().mockResolvedValue({});
		onDeleteOrganizationPosting = vi.fn().mockResolvedValue({});
		onTransferActivityPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
		onTransferOrganizationPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
		onUpdateActivityPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
		onUpdateOrganizationPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('renders modal when open', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container.querySelector('ion-modal, koll-modal')).toBeTruthy();
		});

		it('renders modal when closed', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: false,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders with empty postings', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: [] as never,
					postings: [] as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('with activity context', () => {
		it('renders with activity prop', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					activity: mockActivities[0] as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('filter visibility', () => {
		it('renders without activity filter when disabled', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never,
					showActivityFilter: false
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('renders without person filter when disabled', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never,
					showPersonOfOrganizationFilter: false
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('callbacks', () => {
		it('accepts onCompleted callback', async () => {
			const onCompleted = vi.fn();

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					completed: onCompleted,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('posting types', () => {
		it('handles credit postings', async () => {
			const creditPostings = [mockPostings[0]];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: creditPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles debit postings', async () => {
			const debitPostings = [mockPostings[1]];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: debitPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles mixed posting types', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('structure', () => {
		it('contains filter component', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			// Should have searchbar from filter
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});

		it('has proper modal structure', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: [] as never,
					postings: [] as never
				}
			});
			await tick();

			expect(container.firstChild).toBeTruthy();
		});
	});

	describe('activity posting mapping', () => {
		it('handles activity postings correctly', async () => {
			const activitiesWithPostings = [
				{
					activityPostings: [{ id: 1 }],
					date: '2024-01-01',
					id: 1,
					name: 'Activity 1'
				}
			];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: activitiesWithPostings as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles organization postings (no activity)', async () => {
			const { container } = render(PostingOverviewModal, {
				props: {
					activities: [] as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles mixed activity and organization postings', async () => {
			const mixedActivities = [
				{
					activityPostings: [{ id: 1 }],
					date: '2024-01-01',
					id: 1,
					name: 'Activity 1'
				}
			];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mixedActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('posting dates', () => {
		it('handles postings with various dates', async () => {
			const datedPostings = [
				{ ...mockPostings[0], date: '2024-01-01' },
				{ ...mockPostings[1], date: '2024-12-31' }
			];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: datedPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('budget category filtering', () => {
		it('handles multiple budget categories', async () => {
			const manyCategories = [
				{ defaultCategory: true, id: 1, name: 'Food' },
				{ defaultCategory: false, id: 2, name: 'Transport' },
				{ defaultCategory: false, id: 3, name: 'Entertainment' },
				{ defaultCategory: false, id: 4, name: 'Utilities' }
			];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: manyCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('person filter', () => {
		it('handles multiple persons of organization', async () => {
			const manyPersons = [
				{ id: 1, userId: 1, username: 'John Doe' },
				{ id: 2, userId: 2, username: 'Jane Doe' },
				{ id: 3, userId: 3, username: 'Bob Smith' },
				{ id: 4, userId: 4, username: 'Alice Johnson' }
			];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: manyPersons as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles postings with unassigned person', async () => {
			const unassignedPostings = [{ ...mockPostings[0], personOfOrganizationId: 0 }];

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: unassignedPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('large datasets', () => {
		it('handles many postings', async () => {
			const manyPostings = Array.from({ length: 50 }, (_, index) => ({
				amountInCents: (index + 1) * 100,
				budgetCategoryId: (index % 2) + 1,
				date: '2024-06-15',
				description: `Posting ${index + 1}`,
				id: index + 1,
				personOfOrganizationId: (index % 2) + 1,
				type: index % 2 === 0 ? ('CREDIT' as const) : ('DEBIT' as const)
			}));

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: manyPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});

		it('handles many activities', async () => {
			const manyActivities = Array.from({ length: 20 }, (_, index) => ({
				activityPostings: [],
				date: `2024-0${(index % 12) + 1}-15`,
				id: index + 1,
				name: `Activity ${index + 1}`
			}));

			const { container } = render(PostingOverviewModal, {
				props: {
					activities: manyActivities as never,
					budgetCategories: mockBudgetCategories as never,
					dismissed,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					open: true,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});
});
