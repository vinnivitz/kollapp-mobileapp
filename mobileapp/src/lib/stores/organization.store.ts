import type { OrganizationModel } from '$lib/models/models';
import type { OrganizationStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { organizationResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { accountPostingsStore } from '$lib/stores';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): OrganizationStore {
	const { set, subscribe } = writable<OrganizationModel | undefined>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);
	const organizations = writable<OrganizationModel[]>([]);

	async function init(): Promise<void> {
		let accountPostingsStoreInitialized = false;
		const storedOrganization = await getStoredValue<OrganizationModel>(PreferencesKey.ORGANIZATION);
		if (storedOrganization) {
			organizations.set([storedOrganization]);
			set(storedOrganization);

			accountPostingsStore.init(storedOrganization.id);
			accountPostingsStoreInitialized = true;
			loadedCache.set(true);
		}

		const response = await organizationResource.getAll();

		if (StatusCheck.isOK(response.status)) {
			const allOrganizations = response.data;
			organizations.set(allOrganizations);

			const organizationId = storedOrganization?.id ?? allOrganizations[0]?.id;

			if (!accountPostingsStoreInitialized) {
				await accountPostingsStore.init(organizationId);
				accountPostingsStoreInitialized = true;
			}

			await (organizationId ? update(organizationId) : _set());
		} else if (StatusCheck.isUnauthorized(response.status)) {
			await _set();
		}
		if (!accountPostingsStoreInitialized) {
			await accountPostingsStore.init();
		}
		loadedServer.set(true);
	}

	async function _set(model?: OrganizationModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.ORGANIZATION, model) : removeStoredValue(PreferencesKey.ORGANIZATION));
		set(model);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	async function update(id: number): Promise<void> {
		const response = await organizationResource.getById(id);
		if (StatusCheck.isOK(response.status)) {
			await _set(response.data);
			await accountPostingsStore.update(id);
		}
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
