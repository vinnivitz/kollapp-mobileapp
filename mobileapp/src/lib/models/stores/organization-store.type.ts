import type { OrganizationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel> & {
	initialized: Writable<boolean>;
	organizations: Writable<OrganizationModel[]>;
	update: (organizationId: number) => Promise<void>;
};
