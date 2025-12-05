import type { AuthenticationModel } from '$lib/models/models';

import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import { type AuthenticationStore as AuthenticationStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utility';

function createStore(): AuthenticationStore {
	const { set, subscribe } = writable<AuthenticationModel | undefined>();
	const initialized = writable(false);

	async function init(): Promise<void> {
		const model = await getStoredValue<AuthenticationModel>(PreferencesKey.AUTHENTICATION);
		await _set(model);
		initialized.set(true);
	}

	async function _set(model?: AuthenticationModel): Promise<void> {
		await (model ? storeValue(PreferencesKey.AUTHENTICATION, model) : removeStoredValue(PreferencesKey.AUTHENTICATION));
		set(model);
	}

	async function reset(): Promise<void> {
		await _set();
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
 * Store for authentication information.
 */
export const authenticationStore = createStore();
