import type { AccountPostingType } from '$lib/models/models';

export type AccountPostingModel = {
	activityId: number;
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: AccountPostingType;
};
