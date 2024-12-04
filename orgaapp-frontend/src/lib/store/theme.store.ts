import { writable, type Readable } from 'svelte/store';

import { PreferencesKey, Theme } from '$lib/models';
import { getStoredValue, storeValue } from '$lib/utils';

async function initStore(): Promise<Theme> {
	const value = await getStoredValue<Theme>(PreferencesKey.THEME);
	const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return value === Theme.DARK || (value !== Theme.LIGHT && prefersDarkTheme)
		? Theme.DARK
		: Theme.LIGHT;
}

async function updateTheme(theme: Theme): Promise<void> {
	if (theme) {
		document.body.classList.toggle('dark', theme === Theme.DARK);
		await storeValue(PreferencesKey.THEME, theme);
	}
}

function createStore(): Readable<Theme> & {
	init: () => Promise<void>;
	update: (theme: Theme) => Promise<void>;
} {
	const { subscribe, set } = writable<Theme>(undefined);
	async function init(): Promise<void> {
		const initialTheme = await initStore();
		await updateTheme(initialTheme);
		set(initialTheme);
	}
	async function update(theme: Theme): Promise<void> {
		await updateTheme(theme);
		set(theme);
	}

	return {
		subscribe,
		update,
		init
	};
}

export const themeStore = createStore();
