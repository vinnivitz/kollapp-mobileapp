import type { OrganizationDto } from '$lib/api/dto/server';
import type { OrganizationBaseDto } from '$lib/api/dto/server/organization';
import type { LoadableStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = LoadableStore<OrganizationDto> & {
	organizations: Writable<OrganizationBaseDto[]>;
	update: (organizationId: number) => Promise<void>;
};
