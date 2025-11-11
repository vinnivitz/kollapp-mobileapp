import type { PostingDto } from './posting.dto';

/**
 * Data Transfer Object for activity information.
 */
export type ActivityDto = {
	activityPostings: PostingDto[];
	id: number;
	location: string;
	name: string;
};
