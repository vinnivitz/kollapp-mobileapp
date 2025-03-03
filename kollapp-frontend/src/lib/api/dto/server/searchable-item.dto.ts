import type { PageRoutePaths } from '$lib/models/routing';

export type SearchableItem = {
	id: number;
	label: string;
	route: PageRoutePaths;
	icon: string | undefined;
};
