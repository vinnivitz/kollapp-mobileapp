import type { PageRoutePaths } from '$lib/models/routing';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	icon: string;
	label: string;
	tab: PageRoutePaths;
};
