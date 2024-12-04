import { writable, type Writable } from 'svelte/store';

import * as api from '$lib/api';
import type { UserModel } from '$lib/api/models';
import { isOKStatus, isUnauthorizedStatus } from '$lib/api/utils';
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

	async function init(): Promise<void> {
		const response = await api.user.get(true);
		if (isOKStatus(response.status)) {
			await setUser(response.data);
		} else if (isUnauthorizedStatus(response.status)) {
			await setUser();
		} else {
			const user = await getStoredValue<UserModel>(PreferencesKey.USER);
			if (user) {
				await setUser(user);
			}
		}
	}

	return {
		subscribe,
		update,
		set: setUser,
		init
	};
}

export const userStore = createUserStore();
