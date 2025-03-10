import type { UserRole } from '$lib/models/api';
import type { PageRoutePaths } from '$lib/models/routing';

export type SearchableItemDto = {
	id: number;
	label: string;
	route: PageRoutePaths;
	icon?: string;
	accessible?: UserRole[];
};
