import { writable } from 'svelte/store';

import { PreferencesKey } from '$lib/models/preferences';
import type { ThemeStore } from '$lib/models/store';
import { Theme } from '$lib/models/theme';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createStore(): ThemeStore {
	const { subscribe, set, update } = writable<Theme | undefined>();

	async function init(): Promise<void> {
		const initialTheme = await getInitialTheme();
		await _set(initialTheme);
	}
	async function _set(theme: Theme): Promise<void> {
		document.body.classList.toggle('dark', theme === Theme.DARK);
		await storeValue(PreferencesKey.THEME, theme);
		set(theme);
	}

	async function toggle(): Promise<void> {
		update((theme) => {
			const newTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
			_set(newTheme);
			return newTheme;
		});
	}

	async function reset(): Promise<void> {
		await removeStoredValue(PreferencesKey.THEME);
		set(undefined);
	}

	async function getInitialTheme(): Promise<Theme> {
		const value = await getStoredValue<Theme>(PreferencesKey.THEME);
		const prefersDarkTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
		return value === Theme.DARK || (value !== Theme.LIGHT && prefersDarkTheme)
			? Theme.DARK
			: Theme.LIGHT;
	}

	return {
		subscribe,
		init,
		set: _set,
		toggle,
		reset
	};
}

/**
 * Theme store for handling the current color scheme of the application.
 */
export const themeStore = createStore();
