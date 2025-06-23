import type { BudgetPostingType } from '$lib/models/models';

export type BudgetPostingModel = {
	activityId: number;
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: BudgetPostingType;
};
