import type { PageRoute } from '$lib/models';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	label: string;
	icon: string;
	tab: PageRoute;
};
