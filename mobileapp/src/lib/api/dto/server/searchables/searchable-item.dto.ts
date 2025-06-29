import type { UserRole } from '$lib/models/api';
import type { PageRoutePaths } from '$lib/models/routing';

/**
 * Data Transfer Object for searchable item information.
 */
export type SearchableItemDto = {
	id: number;
	label: string;
	route: PageRoutePaths;
	accessible?: UserRole[];
	icon?: string;
};
