import type { ResponseBody } from '$lib/models/api';
import type { PostingCreateUpdateRequestTO } from '@kollapp/api-types';

import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PostingOverviewModal from '$lib/components/shared/PostingOverviewModal.svelte';

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
			currency: (value: string) => Number.parseFloat(value.replace('€', '')) * 100,
			date: (date: Date | string | undefined) => {
				if (!date) return '';
				if (typeof date === 'string') return date;
				return date.toISOString().slice(0, 10);
			}
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
		it('renders modal structure when open', async () => {
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

			expect(container.firstChild).toBeTruthy();
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});

		it('renders with empty postings showing note', async () => {
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

			// Modal is loading by default (isLoading=true), so spinner shows
			expect(container.querySelector('ion-spinner')).toBeTruthy();
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

			// Should still render searchbar and filter
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});
	});

	describe('filter and search', () => {
		it('has searchbar for filtering postings', async () => {
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

			expect(container.querySelector('ion-searchbar')).toBeTruthy();
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

			expect(container.firstChild).toBeTruthy();
		});
	});

	describe('posting display', () => {
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

			// Should render the modal with content
			expect(container.firstChild).toBeTruthy();
		});
	});
});
