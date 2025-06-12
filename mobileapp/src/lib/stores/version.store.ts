import type { VersionStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { versionResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): VersionStore {
	const { set, subscribe } = writable<string | undefined>();

	async function init(): Promise<void> {
		const response = await versionResource.getApiVersion();
		await (StatusCheck.isOK(response.status) ? _set(response.data) : _set());
	}
	async function _set(value?: string): Promise<void> {
		await (value ? storeValue(PreferencesKey.API_VERSION, value) : removeStoredValue(PreferencesKey.API_VERSION));
		set(value);
	}

	async function reset(): Promise<void> {
		await _set();
	}

	return {
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for app version.
 */
export const versionStore = createStore();
