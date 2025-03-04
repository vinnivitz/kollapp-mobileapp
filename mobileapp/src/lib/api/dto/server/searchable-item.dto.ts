import type { PageRoutePaths } from '$lib/models/routing';

export type SearchableItemDto = {
	id: number;
	label: string;
	route: PageRoutePaths;
	icon?: string;
};
