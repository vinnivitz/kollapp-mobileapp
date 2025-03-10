import type { Readable } from 'svelte/store';

import type { OrganizationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel> & {
	change: (id: string) => Promise<void>;
	initialized: Readable<boolean>;
};
