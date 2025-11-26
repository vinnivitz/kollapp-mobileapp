import type { OrganizationStore } from '$lib/models/stores';
import type { OrganizationMinifiedTO, OrganizationTO } from '@kollapp/api-types';

import { writable } from 'svelte/store';

import { organizationService } from '$lib/api/services';
import { PreferencesKey } from '$lib/models/preferences';
import { deduplicateRequest, getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

const ORGANIZATION_STORE_INIT_REQUEST_KEY = 'organization-store-init';
const ORGANIZATION_STORE_UPDATE_REQUEST_KEY = (id: number): string => `organization-store-update-${id}`;

function createStore(): OrganizationStore {
	const { set, subscribe } = writable<OrganizationTO | undefined>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);
	const organizations = writable<OrganizationMinifiedTO[]>([]);

	async function init(): Promise<void> {
		return deduplicateRequest(ORGANIZATION_STORE_INIT_REQUEST_KEY, async () => {
			const storedOrganization = await getStoredValue<OrganizationTO>(PreferencesKey.ORGANIZATION);
			if (storedOrganization) {
				organizations.set([storedOrganization]);
				set(storedOrganization);
				loadedCache.set(true);
			}

			const response = await organizationService.getAll();

			if (StatusCheck.isOK(response.status)) {
				const allOrganizations = response.data;
				organizations.set(allOrganizations);

				const organizationId = storedOrganization?.id ?? allOrganizations[0]?.id;

				await (organizationId ? update(organizationId) : _set());
			} else if (StatusCheck.isUnauthorized(response.status)) {
				await _set();
			}
			loadedServer.set(true);
		});
	}

	async function _set(model?: OrganizationTO): Promise<void> {
		await (model ? storeValue(PreferencesKey.ORGANIZATION, model) : removeStoredValue(PreferencesKey.ORGANIZATION));
		set(model);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	async function update(id: number): Promise<void> {
		return deduplicateRequest(ORGANIZATION_STORE_UPDATE_REQUEST_KEY(id), async () => {
			const response = await organizationService.getById(id);
			if (StatusCheck.isOK(response.status)) {
				await _set(response.data);
			}
		});
	}

	return {
		init,
		loadedCache,
		loadedServer,
		organizations,
		reset,
		set: _set,
		subscribe,
		update
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
