import type { VersionStore } from '$lib/models/stores';
import type { ApiVersionTO } from '@kollapp/api-types';

import { writable } from 'svelte/store';

import { metaService } from '$lib/api/services';
import { StorageKey } from '$lib/models/storage';
import { removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): VersionStore {
	const { set, subscribe } = writable<ApiVersionTO | undefined>();

	async function init(): Promise<void> {
		const response = await metaService.getApiVersion();
		await (StatusCheck.isOK(response.status) ? _set(response.data) : _set());
	}
	async function _set(value?: ApiVersionTO): Promise<void> {
		await (value ? storeValue(StorageKey.API_VERSION, value) : removeStoredValue(StorageKey.API_VERSION));
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
