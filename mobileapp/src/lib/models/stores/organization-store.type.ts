import type { OrganizationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Readable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel> & {
	initialized: Readable<boolean>;
	change: (id: number) => Promise<void>;
};
