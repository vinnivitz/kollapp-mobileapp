import { writable } from 'svelte/store';

import type { AuthenticationModel } from '$lib/models/models';
import { PreferencesKey } from '$lib/models/preferences';
import { type AuthenticationStore as AuthenticationStore } from '$lib/models/stores';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createStore(): AuthenticationStore {
	const { set, subscribe } = writable<AuthenticationModel | undefined>();

	async function init(): Promise<void> {
		const model = await getStoredValue<AuthenticationModel | undefined>(PreferencesKey.AUTHENTICATION);
		if (model) {
			set(model);
		}
	}

	async function _set(model: AuthenticationModel): Promise<void> {
		await storeValue(PreferencesKey.AUTHENTICATION, model);
		set(model);
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.AUTHENTICATION);
		set(undefined);
	}

	return {
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for authentication information.
 */
export const authenticationStore = createStore();
