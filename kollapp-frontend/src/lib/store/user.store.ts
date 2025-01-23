import { get, writable, type Writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import { StatusChecks } from '$lib/api/utils';
import { PreferencesKey, type UserModel } from '$lib/models';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createUserStore(): Writable<UserModel | undefined> & {
	init: (model?: UserModel) => Promise<void>;
} {
	const { subscribe, set, update } = writable<UserModel | undefined>();

	async function setUser(user?: UserModel): Promise<void> {
		await (user ? storeValue(PreferencesKey.USER, user) : removeStoredValue(PreferencesKey.USER));
		set(user);
	}

	async function init(model?: UserModel): Promise<void> {
		if (model) {
			return setUser(model);
		} else if (get(userStore)) {
			return;
		} else if (!(await getStoredValue<UserModel>(PreferencesKey.ACCESS_TOKEN))) {
			return setUser();
		}
		const body = await apiResources.user.getAuthenticatedUser();
		if (StatusChecks.isOK(body.status)) {
			return setUser({
				surname: body.data.surname,
				name: body.data.name,
				username: body.data.username,
				email: body.data.email
			});
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
