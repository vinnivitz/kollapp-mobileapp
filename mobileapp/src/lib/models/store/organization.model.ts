import type { BaseStore } from '$lib/models/store';

/**
 * Stores basic information about an organization.
 */
export type OrganizationModel = {
	name: string;
};

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel> & {
	exists: () => Promise<boolean>;
};
