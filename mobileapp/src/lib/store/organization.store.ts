import { get, writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import { StatusCheck } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models/preferences';
import type { OrganizationModel, OrganizationStore } from '$lib/models/store';
import { getStoredValue, hasStoredValue, removeStoredValue, storeValue } from '$lib/utils';

async function exists(): Promise<boolean> {
	return !!get(organizationStore) || (await hasStoredValue(PreferencesKey.ORGANIZATION));
}

function createStore(): OrganizationStore {
	const { subscribe, set } = writable<OrganizationModel | undefined>();

	async function init(): Promise<void> {
		if (await getStoredValue<boolean>(PreferencesKey.LOCAL_USER)) {
			const model: OrganizationModel = { name: 'My Collective' };
			return _set(model);
		}

		const body = await apiResources.organization.getOrganization();

		if (StatusCheck.isOK(body.status)) {
			_set({ name: body.data.name });
		} else if (!StatusCheck.isUnauthorized(body.status)) {
			const model = await getStoredValue<OrganizationModel | undefined>(
				PreferencesKey.ORGANIZATION
			);

			if (model) {
				set(model);
			}
		}
	}

	async function _set(model: OrganizationModel): Promise<void> {
		await storeValue(PreferencesKey.ORGANIZATION, model);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.ORGANIZATION);
		set(undefined);
	}

	return {
		subscribe,
		init,
		set: _set,
		reset,
		exists
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
