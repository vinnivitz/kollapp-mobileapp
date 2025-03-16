import type { UserModel } from '$lib/models/models';
import type { UserStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { userResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utils';

function createStore(): UserStore {
	const { set, subscribe } = writable<undefined | UserModel>();

	const initialized = writable<boolean>(false);

	async function init(): Promise<void> {
		const body = await userResource.getByAuthentication();

		if (StatusCheck.isOK(body.status)) {
			_set(body.data);
		} else if (!StatusCheck.isUnauthorized(body.status)) {
			const model = await getStoredValue<undefined | UserModel>(PreferencesKey.USER);

			if (model) {
				set(model);
			}
		}
		initialized.set(true);
	}

	async function _set(model: UserModel): Promise<void> {
		await storeValue(PreferencesKey.USER, model);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.USER);
		set(undefined);
	}

	return {
		init,
		initialized,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * User store for handling the current user information.
 */
export const userStore = createStore();
