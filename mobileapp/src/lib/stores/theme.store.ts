import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import { type ThemeStore } from '$lib/models/stores';
import { Theme } from '$lib/models/ui';
import { getStoredValue, storeValue } from '$lib/utils';

function createStore(): ThemeStore {
	const { subscribe, set } = writable<Theme | undefined>();

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
		const value = await getStoredValue<Theme>(PreferencesKey.THEME);
		return value === Theme.DARK || (value !== Theme.LIGHT && getPreferedColorScheme() === Theme.DARK)
			? Theme.DARK
			: Theme.LIGHT;
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
		subscribe,
		init,
		set: _set,
		reset
	};
}

/**
 * Theme store for handling the current color scheme of the application.
 */
export const themeStore = createStore();
