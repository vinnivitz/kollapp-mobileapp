import type { ActivityItem } from '$lib/models/models';

/**
 * Stores activity information of an organization.
 */
export type ActivityModel = {
	items: ActivityItem[];
	initialized?: boolean;
};
