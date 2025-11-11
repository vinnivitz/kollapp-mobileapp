import type { OrganizationPostingDto } from './organization-posting.dto';

/**
 * Data Transfer Object for activity posting information.
 */
export type ActivityPostingDto = OrganizationPostingDto & {
	activityId: number;
};
