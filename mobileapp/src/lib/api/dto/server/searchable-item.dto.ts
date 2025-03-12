import type { UserRole } from '$lib/models/api';
import type { PageRoutePaths } from '$lib/models/routing';

export type SearchableItemDto = {
	accessible?: UserRole[];
	icon?: string;
	id: number;
	label: string;
	route: PageRoutePaths;
};
