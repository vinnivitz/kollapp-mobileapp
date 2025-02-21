import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import {
	type AuthenticationModel,
	type AuthenticationStore as AuthenticationStore
} from '$lib/models/store';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createStore(): AuthenticationStore {
	const { subscribe, set } = writable<AuthenticationModel | undefined>();

	async function init(): Promise<void> {
		const model = await getStoredValue<AuthenticationModel | undefined>(
			PreferencesKey.AUTHENTICATION
		);
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
		subscribe,
		set: _set,
		init,
		reset
	};
}

/**
 * Store for authentication information.
 */
export const authenticationStore = createStore();
