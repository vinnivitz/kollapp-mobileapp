import type { BaseStore } from './base-store.model';

/**
 * Stores basic information about an organization.
 */
export type OrganizationModel = {
	name: string;
};

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel>;
