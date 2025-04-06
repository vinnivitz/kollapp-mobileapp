import type { UserModel } from '$lib/models/models';
import type { UserStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { userResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): UserStore {
	const { set, subscribe } = writable<undefined | UserModel>();
	const initialized = writable(false);

	async function init(): Promise<void> {
		const body = await userResource.getByAuthentication();

		if (StatusCheck.isOK(body.status)) {
			_set(body.data);
		} else if (StatusCheck.isUnauthorized(body.status)) {
			_set();
		} else {
			const model = await getStoredValue<UserModel>(PreferencesKey.USER);
			_set(model);
		}
	}

	async function _set(model?: UserModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.USER, model) : removeStoredValue(PreferencesKey.USER));
		initialized.set(true);
		set(model);
	}

	async function reset(): Promise<void> {
		_set();
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
