import type { BudgetPostingType } from '$lib/models/models';

/**
 * Data Transfer Object for creating a budget posting.
 */
export type CreateBudgetPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	purpose: string;
	type: BudgetPostingType;
};
