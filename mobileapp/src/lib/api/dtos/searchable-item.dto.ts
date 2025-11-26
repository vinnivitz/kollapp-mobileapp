import type { OrganizationRole } from '@kollapp/api-types';

import type { RouteId } from '$app/types';

/**
 * Data Transfer Object for searchable item information.
 */
export type SearchableItemTO = {
	id: number;
	label: string;
	route: RouteId;
	accessible?: OrganizationRole;
	icon?: string;
};
