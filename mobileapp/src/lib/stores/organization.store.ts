import { writable } from 'svelte/store';

import { organizationResource } from '$lib/api/resources';
import type { OrganizationModel } from '$lib/models/models';
import { PreferencesKey } from '$lib/models/preferences';
import type { OrganizationStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utils';

function createStore(): OrganizationStore {
	const { subscribe, set } = writable<OrganizationModel | undefined>();

	const initialized = writable<boolean>(false);

	async function init(): Promise<void> {
		if (await getStoredValue<boolean>(PreferencesKey.LOCAL_USER)) {
			const model: OrganizationModel = { id: '1', name: 'My Collective' };
			await _set(model);
		}
		const id = await getStoredValue<string>(PreferencesKey.SELECTED_ORGANIZATION_ID);
		if (id) {
			await change(id);
		} else {
			const body = await organizationResource.getIds();

			if (StatusCheck.isOK(body.status)) {
				const id = body.data.length > 0 ? body.data[0] : undefined;
				if (id) {
					await change(id);
				}
			} else if (!StatusCheck.isUnauthorized(body.status)) {
				const model = await getStoredValue<OrganizationModel | undefined>(PreferencesKey.ORGANIZATION);

				if (model) {
					set(model);
				}
			}
		}
		initialized.set(true);
	}

	async function _set(model: OrganizationModel): Promise<void> {
		await storeValue(PreferencesKey.ORGANIZATION, model);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.ORGANIZATION);
		await removeStoredValue(PreferencesKey.SELECTED_ORGANIZATION_ID);
		set(undefined);
	}

	async function change(id: string): Promise<void> {
		const body = await organizationResource.getById(id);
		if (StatusCheck.isOK(body.status)) {
			await _set(body.data);
			await storeValue(PreferencesKey.SELECTED_ORGANIZATION_ID, id);
		} else {
			await reset();
		}
	}

	return {
		subscribe,
		init,
		set: _set,
		reset,
		change,
		initialized
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
