import type { ResponseBody } from '$lib/models/api';
import type { PostingCreateUpdateRequestTO, PostingTO } from '@kollapp/api-types';

import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BudgetOverviewCard from '$lib/components/widgets/budget/BudgetOverviewCard.svelte';

// Mock hasOrganizationRole
vi.mock('$lib/utility', async (importOriginal) => {
	const original = await importOriginal<object>();
	return {
		...original,
		confirmationModal: vi.fn(),
		customForm: vi.fn(),
		formatter: {
			currency: (value: number) => `€${(value / 100).toFixed(2)}`
		},
		getBudgetCategoryNameById: vi.fn(),
		getPersonOfOrganizationId: () => 1,
		getUserId: () => 1,
		getUsernameByPersonOfOrganizationId: vi.fn(),
		getValidationResult: vi.fn(),
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
	{ defaultCategory: true, id: 1, name: 'Category 1' },
	{ defaultCategory: false, id: 2, name: 'Category 2' }
];

const mockPersonsOfOrganization = [
	{ id: 1, userId: 1, username: 'User 1' },
	{ id: 2, userId: 2, username: 'User 2' }
];

const mockPostings = [
	{
		amountInCents: 1000,
		budgetCategoryId: 1,
		date: '2024-01-01',
		description: 'Test Credit',
		id: 1,
		personOfOrganizationId: 1,
		type: 'CREDIT' as const
	},
	{
		amountInCents: 500,
		budgetCategoryId: 2,
		date: '2024-01-02',
		description: 'Test Debit',
		id: 2,
		personOfOrganizationId: 2,
		type: 'DEBIT' as const
	}
];

describe('widgets/budget/BudgetOverviewCard', () => {
	let onCreateActivityPosting: (
		activityId: number,
		model: PostingCreateUpdateRequestTO
	) => Promise<ResponseBody<PostingTO>>;
	let onCreateOrganizationPosting: (model: PostingCreateUpdateRequestTO) => Promise<ResponseBody<PostingTO>>;
	let onDeleteActivityPosting: (postingId: number) => Promise<ResponseBody>;
	let onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
	let onTransferActivityPosting: (postingId: number, targetActivityId: number) => Promise<ResponseBody<PostingTO>>;
	let onTransferOrganizationPosting: (postingId: number) => Promise<ResponseBody<PostingTO>>;
	let onUpdateActivityPosting: (
		postingId: number,
		activityId: number,
		model: PostingCreateUpdateRequestTO
	) => Promise<ResponseBody<PostingTO>>;
	let onUpdateOrganizationPosting: (
		postingId: number,
		model: PostingCreateUpdateRequestTO
	) => Promise<ResponseBody<PostingTO>>;

	beforeEach(() => {
		onCreateActivityPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
		onCreateOrganizationPosting = vi.fn().mockResolvedValue({ data: mockPostings[0] });
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
		it('renders with title', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never,
					title: 'Budget Overview'
				}
			});
			await tick();

			expect(container.textContent).toContain('Budget Overview');
		});

		it('displays balance', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never,
					title: 'Budget'
				}
			});
			await tick();

			// Balance: 1000 (credit) - 500 (debit) = 500 cents = €5.00
			expect(container.textContent).toContain('€5.00');
		});

		it('renders without postings', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: [] as never,
					title: 'Empty Budget'
				}
			});
			await tick();

			// Balance should be €0.00
			expect(container.textContent).toContain('€0.00');
		});

		it('renders card component', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: mockActivities as never,
					budgetCategories: mockBudgetCategories as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: mockPersonsOfOrganization as never,
					postings: mockPostings as never,
					title: 'Budget'
				}
			});
			await tick();

			expect(container.querySelector('ion-card')).toBeTruthy();
		});
	});

	describe('balance calculation', () => {
		it('calculates positive balance correctly', async () => {
			const postings = [{ amountInCents: 2000, id: 1, personOfOrganizationId: 1, type: 'CREDIT' as const }];

			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: postings as never,
					title: 'Budget'
				}
			});
			await tick();

			expect(container.textContent).toContain('€20.00');
		});

		it('calculates negative balance correctly', async () => {
			const postings = [{ amountInCents: 500, id: 1, personOfOrganizationId: 1, type: 'DEBIT' as const }];

			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: postings as never,
					title: 'Budget'
				}
			});
			await tick();

			// -500 cents = -€5.00
			expect(container.textContent).toContain('€-5.00');
		});
	});

	describe('props', () => {
		it('accepts tourId prop', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: [] as never,
					title: 'Budget',
					tourId: 'budget-tour'
				}
			});
			await tick();

			expect(container.querySelector('[data-tour="budget-tour"]')).toBeTruthy();
		});

		it('accepts onOpenStatistics callback', async () => {
			const onOpenStatistics = vi.fn();

			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onOpenStatistics,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: [] as never,
					title: 'Budget'
				}
			});
			await tick();

			expect(container).toBeTruthy();
		});
	});

	describe('structure', () => {
		it('has flex container for balance display', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: [] as never,
					title: 'Budget'
				}
			});
			await tick();

			expect(container.querySelector('.flex')).toBeTruthy();
		});

		it('has text element for balance', async () => {
			const { container } = render(BudgetOverviewCard, {
				props: {
					activities: [] as never,
					budgetCategories: [] as never,
					onCreateActivityPosting,
					onCreateOrganizationPosting,
					onDeleteActivityPosting,
					onDeleteOrganizationPosting,
					onTransferActivityPosting,
					onTransferOrganizationPosting,
					onUpdateActivityPosting,
					onUpdateOrganizationPosting,
					personsOfOrganization: [] as never,
					postings: [] as never,
					title: 'Budget'
				}
			});
			await tick();

			expect(container.querySelector('ion-text')).toBeTruthy();
		});
	});
});
