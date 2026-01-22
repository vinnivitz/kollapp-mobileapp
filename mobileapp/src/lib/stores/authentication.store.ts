import type { AuthenticationModel } from '$lib/models/models';

import { writable } from 'svelte/store';

import { StorageKey, StorageStrategy } from '$lib/models/storage';
import { type AuthenticationStore as AuthenticationStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utility';

function createStore(): AuthenticationStore {
	const { set, subscribe } = writable<AuthenticationModel | undefined>();
	const initialized = writable(false);

	async function initialize(): Promise<void> {
		const model = await getStoredValue<AuthenticationModel>(StorageKey.AUTHENTICATION, StorageStrategy.SECURE);
		if (model) {
			set(model);
		}
		initialized.set(true);
	}

	async function _set(model?: AuthenticationModel): Promise<void> {
		await (model
			? storeValue(StorageKey.AUTHENTICATION, model, StorageStrategy.SECURE)
			: removeStoredValue(StorageKey.AUTHENTICATION, StorageStrategy.SECURE));
		set(model);
	}

	async function reset(): Promise<void> {
		await _set();
	}

	return {
		initialize,
		initialized,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for authentication information.
 */
export const authenticationStore = createStore();
