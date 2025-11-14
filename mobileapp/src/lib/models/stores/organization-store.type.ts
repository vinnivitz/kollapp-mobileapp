import type { LoadableStore } from '$lib/models/stores';
import type { OrganizationMinifiedTO, OrganizationTO } from '@kollapp/api-types';
import type { Writable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = LoadableStore<OrganizationTO> & {
	organizations: Writable<OrganizationMinifiedTO[]>;
	update: (organizationId: number) => Promise<void>;
};
