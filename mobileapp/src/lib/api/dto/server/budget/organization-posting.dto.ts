import type { PostingType } from '$lib/models/models';

/**
 * Data Transfer Object for organization posting information.
 */
export type OrganizationPostingDto = {
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: PostingType;
};
