import type { AccountPostingType } from '$lib/models/models';

/**
 * Data Transfer Object for account posting information.
 */
export type AccountPostingDto = {
	activityId: number;
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: AccountPostingType;
};
