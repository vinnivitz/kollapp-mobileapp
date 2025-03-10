import { writable } from 'svelte/store';

import { userResource } from '$lib/api/resources';
import { UserRole } from '$lib/models/api';
import type { UserModel } from '$lib/models/models';
import { PreferencesKey } from '$lib/models/preferences';
import type { UserStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utils';

function createStore(): UserStore {
	const { subscribe, set } = writable<UserModel | undefined>();

	const initialized = writable<boolean>(false);

	async function init(): Promise<void> {
		if (await getStoredValue<boolean>(PreferencesKey.LOCAL_USER)) {
			const model: UserModel = {
				name: 'John',
				surname: 'Doe',
				email: 'john@doe.com',
				username: 'johndoe',
				roles: [UserRole.MANAGER, UserRole.MEMBER]
			};
			return _set(model);
		}
		const body = await userResource.getByAuthentication();

		if (StatusCheck.isOK(body.status)) {
			_set(body.data);
		} else if (!StatusCheck.isUnauthorized(body.status)) {
			const model = await getStoredValue<UserModel | undefined>(PreferencesKey.USER);

			if (model) {
				set(model);
			}
		}
		initialized.set(true);
	}

	async function _set(model: UserModel): Promise<void> {
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
		initialized
	};
}

/**
 * User store for handling the current user information.
 */
export const userStore = createStore();
