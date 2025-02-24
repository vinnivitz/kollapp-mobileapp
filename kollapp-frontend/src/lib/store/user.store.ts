import { writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import { StatusCheck } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models/preferences';
import type { UserModel, UserStore } from '$lib/models/store';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

async function exists(): Promise<boolean> {
	return !!(await getStoredValue(PreferencesKey.USER));
}

function createStore(): UserStore {
	const { subscribe, set } = writable<UserModel | undefined>();

	async function init(): Promise<void> {
		const body = await apiResources.user.getAuthenticatedUser();

		if (StatusCheck.isOK(body.status)) {
			_set({
				username: body.data.username,
				email: body.data.email,
				name: body.data.name
			});
		} else if (!StatusCheck.isUnauthorized(body.status)) {
			const model = await getStoredValue<UserModel | undefined>(PreferencesKey.USER);

			if (model) {
				set(model);
			}
		}
	}

	async function _set(model?: UserModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.USER, model) : removeStoredValue(PreferencesKey.USER));
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.USER);
		set(undefined);
	}

	return {
		subscribe,
		init,
		set: _set,
		reset,
		exists
	};
}

/**
 * User store for handling the current user information.
 */
export const userStore = createStore();
