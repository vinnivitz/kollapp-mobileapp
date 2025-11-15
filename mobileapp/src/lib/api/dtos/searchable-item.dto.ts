import type { OrganizationRole } from '@kollapp/api-types';

import type { RouteId } from '$app/types';

/**
 * Data Transfer Object for searchable item information.
 */
export type SearchableItemDto = {
	id: number;
	label: string;
	route: RouteId;
	accessible?: OrganizationRole;
	icon?: string;
};
