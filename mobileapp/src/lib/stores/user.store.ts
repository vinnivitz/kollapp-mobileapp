import type { UserStore } from '$lib/models/stores';
import type { KollappUserTO } from '@kollapp/api-types';

import { writable } from 'svelte/store';

import { userService } from '$lib/api/services';
import { StorageKey } from '$lib/models/storage';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): UserStore {
	const { set, subscribe } = writable<KollappUserTO | undefined>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);

	async function initialize(): Promise<void> {
		const storedUser = await getStoredValue<KollappUserTO>(StorageKey.USER);
		if (storedUser) {
			set(storedUser);
			loadedCache.set(true);
		}

		const response = await userService.get();

		if (StatusCheck.isOK(response.status)) {
			await _set(response.data);
		} else if (StatusCheck.isUnauthorized(response.status)) {
			await _set();
		}

		loadedServer.set(true);
	}

	async function _set(model?: KollappUserTO): Promise<void> {
		await (model ? storeValue(StorageKey.USER, model) : removeStoredValue(StorageKey.USER));
		set(model);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	return {
		initialize,
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
