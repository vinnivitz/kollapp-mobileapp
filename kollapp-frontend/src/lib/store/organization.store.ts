import { writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import { StatusChecks } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models/preferences';
import type { OrganizationModel, OrganizationStore } from '$lib/models/store';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createStore(): OrganizationStore {
	const { subscribe, set } = writable<OrganizationModel | undefined>();

	async function init(): Promise<void> {
		const body = await apiResources.organization.getOrganization();

		if (StatusChecks.isOK(body.status)) {
			_set({ name: body.data.name });
		} else if (!StatusChecks.isUnauthorized(body.status)) {
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
		reset
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
