import { writable, type Readable } from 'svelte/store';

import { PreferencesKey, Theme } from '$lib/models';
import { getStoredValue, storeValue } from '$lib/utils';

async function initStore(): Promise<Theme> {
	const value = await getStoredValue<Theme>(PreferencesKey.THEME);
	const prefersDarkTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
	return value === Theme.DARK || (value !== Theme.LIGHT && prefersDarkTheme)
		? Theme.DARK
		: Theme.LIGHT;
}

async function updateTheme(theme: Theme): Promise<void> {
	document.body.classList.toggle('dark', theme === Theme.DARK);
	await storeValue(PreferencesKey.THEME, theme);
}

function createStore(): Readable<Theme> & {
	setTheme: (theme: Theme) => Promise<void>;
	init: () => Promise<void>;
} {
	const { subscribe, set } = writable<Theme>();
	async function init(): Promise<void> {
		const initialTheme = await initStore();
		await updateTheme(initialTheme);
		set(initialTheme);
	}
	async function setTheme(theme: Theme): Promise<void> {
		await updateTheme(theme);
		set(theme);
	}

	return {
		subscribe,
		setTheme,
		init
	};
}

/**
 * Theme store for handling the current color scheme of the application.
 */
export const themeStore = createStore();
