import type { BudgetPostingType } from '$lib/models/models';

export type BudgetPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: BudgetPostingType;
};
