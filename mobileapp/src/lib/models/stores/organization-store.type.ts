import type { OrganizationModel } from '$lib/models/models';
import type { LoadableStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = LoadableStore<OrganizationModel> & {
	organizations: Writable<OrganizationModel[]>;
	update: (organizationId: number) => Promise<void>;
};
