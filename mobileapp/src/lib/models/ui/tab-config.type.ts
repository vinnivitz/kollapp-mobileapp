import type { RouteId } from '$app/types';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	icon: string;
	label: string;
	tab: RouteId;
};
