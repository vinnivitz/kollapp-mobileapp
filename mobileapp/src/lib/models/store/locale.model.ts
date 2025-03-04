import type { BaseStore } from '$lib/models/store';

/**
 * Locale enum for the supported languages.
 */
export enum Locale {
	DE = 'de',
	EN = 'en'
}

/**
 * Store for authentication tokens.
 */
export type LocaleStore = BaseStore<Locale>;
