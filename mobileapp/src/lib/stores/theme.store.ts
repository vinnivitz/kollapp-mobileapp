import { writable } from 'svelte/store';

import { StorageKey } from '$lib/models/storage';
import { type ThemeStore } from '$lib/models/stores';
import { Theme } from '$lib/models/ui';
import { getStoredValue, storeValue } from '$lib/utility';

function createStore(): ThemeStore {
	const { set, subscribe } = writable<Theme | undefined>();

	async function init(): Promise<void> {
		const theme = await getStoredValue<Theme>(StorageKey.THEME);
		if (theme) {
			setClass(theme);
			set(theme);
		} else {
			const initialTheme = getPreferedColorScheme();
			await _set(initialTheme);
		}
	}

	async function _set(value: Theme): Promise<void> {
		setClass(value);
		await storeValue(StorageKey.THEME, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(getPreferedColorScheme());
	}

	function getPreferedColorScheme(): Theme {
		return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
	}

	function setClass(value: Theme): void {
		if (value === Theme.SYSTEM) {
			value = getPreferedColorScheme();
			return setClass(value);
		}
		document.body.classList.add(value);
		document.body.classList.remove(...Object.values(Theme).filter((theme) => theme !== value));
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
