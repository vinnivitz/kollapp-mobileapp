import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import { type ThemeStore } from '$lib/models/stores';
import { Theme } from '$lib/models/ui';
import { getStoredValue, storeValue } from '$lib/utility';

function createStore(): ThemeStore {
	const { set, subscribe } = writable<Theme | undefined>();

	async function init(): Promise<void> {
		const initialTheme = await getInitialTheme();
		await _set(initialTheme);
	}
	async function _set(value: Theme): Promise<void> {
		setClass(value);
		await storeValue(PreferencesKey.THEME, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(getPreferedColorScheme());
	}

	async function getInitialTheme(): Promise<Theme> {
		return (await getStoredValue<Theme>(PreferencesKey.THEME)) || getPreferedColorScheme();
	}

	function getPreferedColorScheme(): Theme {
		return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
	}

	function setClass(value: Theme): void {
		if (value === Theme.SYSTEM) {
			value = getPreferedColorScheme();
			setClass(value);
			return;
		}

		document.body.classList.remove(...Object.values(Theme));
		document.body.classList.add(value);
	}

	return {
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Theme store for handling the current color scheme of the application.
 */
export const themeStore = createStore();
