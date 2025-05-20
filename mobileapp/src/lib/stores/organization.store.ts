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
	const organizations = writable<OrganizationModel[]>([]);

	async function init(): Promise<void> {
		let selectedOrganizationId = await getStoredValue<number>(PreferencesKey.SELECTED_ORGANIZATION_ID);
		const response = await organizationResource.getAll();
		if (StatusCheck.isOK(response.status)) {
			organizations.set(response.data);
			if (response.data.length > 0) {
				selectedOrganizationId ??= response.data[0]?.id;
			} else if (!StatusCheck.isUnauthorized(response.status)) {
				const storedOrganization = await getStoredValue<OrganizationModel>(PreferencesKey.ORGANIZATION);
				await _set(storedOrganization);
				selectedOrganizationId ??= storedOrganization?.id;
			}
		}
		if (selectedOrganizationId) {
			await storeValue(PreferencesKey.SELECTED_ORGANIZATION_ID, selectedOrganizationId);
			await change(selectedOrganizationId);
		} else {
			await _set();
			await activitiesStore.init();
		}
		initialized.set(true);
	}

	async function _set(model?: OrganizationModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.ORGANIZATION, model) : removeStoredValue(PreferencesKey.ORGANIZATION));
		set(model);
	}

	async function reset(): Promise<void> {
		initialized.set(false);
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
		organizations,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
