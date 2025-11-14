import type { PageRoutePaths } from '$lib/models/routing';
import type { OrganizationRole } from '@kollapp/api-types';

/**
 * Data Transfer Object for searchable item information.
 */
export type SearchableItemDto = {
	id: number;
	label: string;
	route: PageRoutePaths;
	accessible?: OrganizationRole;
	icon?: string;
};
