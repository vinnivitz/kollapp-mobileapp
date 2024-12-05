import type { PageRoute } from './index.js';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	label: string;
	icon: string;
	tab: PageRoute;
};
