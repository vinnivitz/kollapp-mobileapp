import type { OrganizationModel } from '$lib/models/models';
import type { OrganizationStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { activitiesStore } from './activity.store';

import { organizationResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utils';

function createStore(): OrganizationStore {
	const { set, subscribe } = writable<OrganizationModel | undefined>();

	const initialized = writable<boolean>(false);

	async function init(): Promise<void> {
		try {
			const storedOrganizationId = await getStoredValue<string>(PreferencesKey.SELECTED_ORGANIZATION_ID);
			if (storedOrganizationId) {
				return change(storedOrganizationId);
			}

			const response = await organizationResource.getIds();
			if (StatusCheck.isOK(response.status) && response.data.length > 0) {
				return response.data[0] ? change(response.data[0]) : set(undefined);
			} else if (!StatusCheck.isUnauthorized(response.status)) {
				const storedOrganization = await getStoredValue<OrganizationModel | undefined>(PreferencesKey.ORGANIZATION);
				if (storedOrganization) {
					set(storedOrganization);
					return activitiesStore.init(storedOrganization.id);
				}
				return set(undefined);
			}
		} finally {
			initialized.set(true);
		}
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
			await activitiesStore.init(id);
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
