import type { ActivityModel } from '$lib/models/models';
import type { ActivityStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { organizationResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): ActivityStore {
	const { set, subscribe } = writable<ActivityModel | undefined>();

	async function init(organizationId?: number): Promise<void> {
		if (organizationId) {
			await change(organizationId);
		} else {
			const model = await getStoredValue<ActivityModel | undefined>(PreferencesKey.ACTIVITIES);
			if (model) {
				set({ ...model, initialized: true });
			}
		}
	}

	async function _set(model: ActivityModel): Promise<void> {
		await storeValue(PreferencesKey.ACTIVITIES, model);
		set({ ...model, initialized: true });
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.ACTIVITIES);
		set(undefined);
	}

	async function change(organizationId: number): Promise<void> {
		const body = await organizationResource.getActivities(organizationId);
		if (StatusCheck.isOK(body.status)) {
			const items = body.data.map((activity) => ({
				id: activity.id,
				location: activity.location,
				name: activity.name
			}));
			await _set({ items });
		}
	}

	return {
		change,
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Activities store for handling the current activities of the selected organization.
 */
export const activitiesStore = createStore();
