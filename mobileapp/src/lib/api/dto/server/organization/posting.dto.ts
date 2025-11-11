import type { PostingType } from '$lib/models/models';

/**
 * Data Transfer Object for posting information.
 */
export type PostingDto = {
	amountInCents: number;
	date: string;
	id: number;
	purpose: string;
	type: PostingType;
};
