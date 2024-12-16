import { get, writable, type Writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import type { UserModel } from '$lib/api/models';
import { StatusChecks } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createUserStore(): Writable<UserModel | undefined> & { init: () => Promise<void> } {
	const { subscribe, set, update } = writable<UserModel | undefined>();

	async function setUser(user?: UserModel): Promise<void> {
		set(user);
		if (user) {
			await storeValue(PreferencesKey.USER, user);
		} else {
			set(undefined);
			await removeStoredValue(PreferencesKey.USER);
		}
	}

	async function init(refresh = false): Promise<void> {
		if (!refresh && Boolean(get(userStore))) {
			return;
		}
		const body = await apiResources.user.get(true);
		if (StatusChecks.isOK(body.status)) {
			return setUser({ id: 'user-id', username: body.data.username, email: body.data.email });
		}
		return StatusChecks.isUnauthorized(body.status)
			? setUser()
			: setUser(await getStoredValue<UserModel>(PreferencesKey.USER));
	}

	return {
		subscribe,
		update,
		set: setUser,
		init
	};
}

/**
 * User store for handling the current user information.
 */
export const userStore = createUserStore();
