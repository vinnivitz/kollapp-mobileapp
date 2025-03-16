import { isPlatform } from '@ionic/core';
import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import { type LayoutStore } from '$lib/models/stores';
import { Layout } from '$lib/models/ui';
import { getStoredValue, storeValue } from '$lib/utils';

function createStore(): LayoutStore {
	const { set, subscribe } = writable<Layout | undefined>();

	async function init(): Promise<void> {
		const value = await getStoredValue<Layout | undefined>(PreferencesKey.LAYOUT);
		if (value) {
			set(value);
			document.documentElement.setAttribute('mode', value);
		} else {
			_set(getDefaultLayout());
		}
	}
	async function _set(value: Layout): Promise<void> {
		await storeValue(PreferencesKey.LAYOUT, value);
		set(value);
		document.documentElement.setAttribute('mode', value);
	}

	async function reset(): Promise<void> {
		await _set(getDefaultLayout());
	}

	function getDefaultLayout(): Layout {
		return isPlatform('ios') ? Layout.IOS : Layout.MD;
	}

	return {
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for app layout.
 */
export const layoutStore = createStore();
