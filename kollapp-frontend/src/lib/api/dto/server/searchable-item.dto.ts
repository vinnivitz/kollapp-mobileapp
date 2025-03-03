import type { PageRoutePaths } from '$lib/models/routing';

export type SearchableItem = {
	id: string;
	label: string;
	route: PageRoutePaths;
	icon: string | undefined;
};
