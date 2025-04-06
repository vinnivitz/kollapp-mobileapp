import type { OrganizationModel } from '$lib/models/models';
import type { OrganizationStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { activitiesStore } from './activity.store';

import { organizationResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): OrganizationStore {
	const { set, subscribe } = writable<OrganizationModel | undefined>();
	const initialized = writable(false);

	async function init(): Promise<void> {
		let selectedOrganizationId = await getStoredValue<number>(PreferencesKey.SELECTED_ORGANIZATION_ID);
		if (!selectedOrganizationId) {
			const response = await organizationResource.getIds();
			if (StatusCheck.isOK(response.status) && response.data.length > 0) {
				selectedOrganizationId = response.data[0] as number;
			} else if (!StatusCheck.isUnauthorized(response.status)) {
				const storedOrganization = await getStoredValue<OrganizationModel>(PreferencesKey.ORGANIZATION);
				_set(storedOrganization);
				selectedOrganizationId = storedOrganization?.id;
			}
		}
		if (selectedOrganizationId) {
			await storeValue(PreferencesKey.SELECTED_ORGANIZATION_ID, selectedOrganizationId);
			change(selectedOrganizationId);
		}
	}

	async function _set(model?: OrganizationModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.ORGANIZATION, model) : removeStoredValue(PreferencesKey.ORGANIZATION));
		initialized.set(true);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.SELECTED_ORGANIZATION_ID);
		_set();
	}

	async function change(id: number): Promise<void> {
		const body = await organizationResource.getById(id);
		if (StatusCheck.isOK(body.status)) {
			await _set(body.data);
			await storeValue(PreferencesKey.SELECTED_ORGANIZATION_ID, id);
			await activitiesStore.init();
		}
	}

	return {
		change,
		init,
		initialized,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
