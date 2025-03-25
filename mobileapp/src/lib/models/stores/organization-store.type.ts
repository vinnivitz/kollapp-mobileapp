import type { OrganizationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';

/**
 * Store for organization information.
 */
export type OrganizationStore = BaseStore<OrganizationModel> & {
	change: (id: number) => Promise<void>;
};
