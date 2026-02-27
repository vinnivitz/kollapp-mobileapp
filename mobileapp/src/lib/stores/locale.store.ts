import type { LocaleStore } from '$lib/models/stores';

import { Device } from '@capacitor/device';
import { setDefaultOptions } from 'date-fns';
import { writable } from 'svelte/store';

import { loadTranslations, Locale, locale } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { getDateFnsLocale, getStoredValue, storeValue } from '$lib/utility';

function createStore(): LocaleStore {
	const { set, subscribe } = writable<Locale | undefined>();

	async function initialize(): Promise<void> {
		const value = await getInitialLocale();
		await loadTranslations(value);
		locale.set(value);
		setDefaultOptions({ locale: getDateFnsLocale(value) });
		set(value);
	}
	async function _set(value: Locale): Promise<void> {
		await storeValue(StorageKey.LOCALE, value);
		locale.set(value);
		setDefaultOptions({ locale: getDateFnsLocale(value) });
		set(value);
	}

	async function reset(): Promise<void> {
		await _set((await getLocaleFromDevice()) ?? Locale.DE);
	}

	async function getInitialLocale(): Promise<Locale> {
		return (
			(await getStoredValue<Locale>(StorageKey.LOCALE)) ??
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
		initialize,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for locale.
 */
export const localeStore = createStore();
