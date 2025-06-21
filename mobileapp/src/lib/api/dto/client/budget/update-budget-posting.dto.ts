import type { BudgetPostingType } from '$lib/models/models';

/**
 * Data Transfer Object for updating a budget posting.
 */
export type UpdateBudgetPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	purpose: string;
	type: BudgetPostingType;
};
