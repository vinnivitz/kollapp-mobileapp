import type { UserDto } from '$lib/api/dto/server/user.dto';
import type { UserStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { userResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { deduplicateRequest, getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): UserStore {
	const { set, subscribe } = writable<undefined | UserDto>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);

	async function init(): Promise<void> {
		return deduplicateRequest('user-store-init', async () => {
			const storedUser = await getStoredValue<UserDto>(PreferencesKey.USER);
			if (storedUser) {
				await _set(storedUser);
				loadedCache.set(true);
			}

			const response = await userResource.get();

			if (StatusCheck.isOK(response.status)) {
				await _set(response.data);
			} else if (StatusCheck.isUnauthorized(response.status)) {
				await _set();
			}

			loadedServer.set(true);
		});
	}

	async function _set(model?: UserDto): Promise<void> {
		await (model ? storeValue(PreferencesKey.USER, model) : removeStoredValue(PreferencesKey.USER));
		set(model);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	return {
		init,
		loadedCache,
		loadedServer,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * User store for handling the current user information.
 */
export const userStore = createStore();
