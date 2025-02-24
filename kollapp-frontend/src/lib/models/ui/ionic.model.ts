import { PageRoute } from '$lib/models/routing';

/**
 * Configuration for a page route tab.
 */
export type TabConfig = {
	label: string;
	icon: string;
	tab: PageRoutePaths;
};

type ExtractPaths<T> = T extends string ? T : { [K in keyof T]: ExtractPaths<T[K]> }[keyof T];

type PageRoutePaths = ExtractPaths<typeof PageRoute>;
