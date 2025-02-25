import type { BaseStore } from '$lib/models/store';

/**
 * Theme model for available color schemes.
 */
export enum Theme {
	SYSTEM = 'system',
	LIGHT = 'light',
	DARK = 'dark',
	FANCY = 'fancy'
}

/**
 * Theme store model.
 */
export type ThemeStore = BaseStore<Theme>;
