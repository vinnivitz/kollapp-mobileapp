import type { ActivityModel } from '$lib/models/models';
import type { ActivityStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { organizationResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utility';

function createStore(): ActivityStore {
	const { set, subscribe } = writable<ActivityModel[] | undefined>();
	const initialized = writable(false);

	async function init(): Promise<void> {
		const organizationId = await getStoredValue<number>(PreferencesKey.SELECTED_ORGANIZATION_ID);
		if (organizationId) {
			await change(organizationId);
		} else {
			const model = await getStoredValue<ActivityModel[]>(PreferencesKey.ACTIVITIES);
			_set(model);
		}
	}

	async function _set(model?: ActivityModel[]): Promise<void> {
		await (model ? storeValue(PreferencesKey.ACTIVITIES, model) : removeStoredValue(PreferencesKey.ACTIVITIES));
		initialized.set(true);
		set(model);
	}

	async function reset(): Promise<void> {
		_set();
	}

	async function change(organizationId: number): Promise<void> {
		const body = await organizationResource.getActivities(organizationId);
		await _set(body.data);
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
 * Activities store for handling the current activities of the selected organization.
 */
export const activitiesStore = createStore();
