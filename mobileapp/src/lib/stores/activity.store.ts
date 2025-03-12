import { writable } from 'svelte/store';

import { organizationResource } from '$lib/api/resources';
import type { ActivityModel } from '$lib/models/models';
import { PreferencesKey } from '$lib/models/preferences';
import type { ActivityStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utils';

function createStore(): ActivityStore {
	const { set, subscribe } = writable<ActivityModel[]>([]);

	const initialized = writable<boolean>(false);

	async function init(organizationId?: string): Promise<void> {
		if (organizationId) {
			await change(organizationId);
		} else {
			const model = await getStoredValue<ActivityModel[]>(PreferencesKey.ACTIVITIES);
			if (model) {
				set(model);
			}
		}
		initialized.set(true);
	}

	async function _set(model: ActivityModel[]): Promise<void> {
		await storeValue(PreferencesKey.ACTIVITIES, model);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.ACTIVITIES);
		set([]);
	}

	async function change(organizationId: string): Promise<void> {
		const body = await organizationResource.getActivities(organizationId);
		if (StatusCheck.isOK(body.status)) {
			await _set(body.data);
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
 * Activities store for handling the current activities of the selected organization.
 */
export const activitiesStore = createStore();
