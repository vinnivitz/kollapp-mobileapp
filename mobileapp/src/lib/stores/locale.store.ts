import { Device } from '@capacitor/device';
import { writable } from 'svelte/store';

import { loadTranslations, Locale, locale } from '$lib/locales';
import { PreferencesKey } from '$lib/models/preferences';
import type { LocaleStore } from '$lib/models/stores';
import { getStoredValue, storeValue } from '$lib/utils';

function createStore(): LocaleStore {
	const { subscribe, set } = writable<Locale | undefined>();

	async function init(): Promise<void> {
		const value = await getInitialLocale();
		await loadTranslations(value);
		await _set(value);
	}
	async function _set(value: Locale): Promise<void> {
		await storeValue(PreferencesKey.LOCALE, value);
		locale.set(value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set((await getLocaleFromDevice()) ?? Locale.DE);
	}

	async function getInitialLocale(): Promise<Locale> {
		return (
			(await getStoredValue<Locale>(PreferencesKey.LOCALE)) ??
			(await getLocaleFromDevice()) ??
			(process.env.LOCALE as Locale | undefined) ??
			Locale.DE
		);
	}

	async function getLocaleFromDevice(): Promise<Locale | undefined> {
		const code = await Device.getLanguageCode();
		const locale = code?.value as Locale | undefined;
		return locale && Object.values(Locale).includes(locale) ? locale : undefined;
	}

	return {
		subscribe,
		set: _set,
		init,
		reset
	};
}

/**
 * Store for locale.
 */
export const localeStore = createStore();
