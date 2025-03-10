import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import { type LayoutStore } from '$lib/models/stores';
import { Layout } from '$lib/models/ui';
import { getStoredValue, storeValue } from '$lib/utils';

function createStore(): LayoutStore {
	const { subscribe, set } = writable<Layout | undefined>();

	async function init(): Promise<void> {
		const value = await getStoredValue<Layout | undefined>(PreferencesKey.LAYOUT);
		if (value) {
			set(value);
		} else {
			_set(Layout.CLASSIC);
		}
	}
	async function _set(value: Layout): Promise<void> {
		await storeValue(PreferencesKey.LAYOUT, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(Layout.CLASSIC);
	}

	return {
		subscribe,
		set: _set,
		init,
		reset
	};
}

/**
 * Store for app layout.
 */
export const layoutStore = createStore();
