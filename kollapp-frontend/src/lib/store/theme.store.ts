import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import type { ThemeStore } from '$lib/models/store';
import { Theme } from '$lib/models/theme';
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
		return value === Theme.DARK ||
			(value !== Theme.LIGHT && getPreferedColorScheme() === Theme.DARK)
			? Theme.DARK
			: Theme.LIGHT;
	}

	function getPreferedColorScheme(): Theme {
		return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
	}

	function setClass(value: Theme): void {
		switch (value) {
			case Theme.DARK: {
				document.body.classList.add(Theme.DARK);
				document.body.classList.remove(Theme.LIGHT);
				document.body.classList.remove(Theme.FANCY);
				break;
			}
			case Theme.LIGHT: {
				document.body.classList.add(Theme.LIGHT);
				document.body.classList.remove(Theme.DARK);
				document.body.classList.remove(Theme.FANCY);
				break;
			}
			case Theme.FANCY: {
				document.body.classList.add(Theme.FANCY);
				document.body.classList.remove(Theme.DARK);
				document.body.classList.remove(Theme.LIGHT);
				break;
			}
			case Theme.SYSTEM: {
				value = getPreferedColorScheme();
				setClass(value);
				break;
			}
		}
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
