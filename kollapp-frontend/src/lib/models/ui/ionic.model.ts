import type { PageRoute } from '$lib/models/routing';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	label: string;
	icon: string;
	tab: PageRoute;
};
