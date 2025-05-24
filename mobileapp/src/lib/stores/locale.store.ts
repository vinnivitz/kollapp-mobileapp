import type { LocaleStore } from '$lib/models/stores';

import { Device } from '@capacitor/device';
import { setDefaultOptions } from 'date-fns';
import { type Locale as DateFnsLocale, de, enUS } from 'date-fns/locale';
import { writable } from 'svelte/store';

import { loadTranslations, Locale, locale } from '$lib/locales';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, storeValue } from '$lib/utility';

function createStore(): LocaleStore {
	const { set, subscribe } = writable<Locale | undefined>();

	async function init(): Promise<void> {
		const value = await getInitialLocale();
		await loadTranslations(value);
		await _set(value);
	}
	async function _set(value: Locale): Promise<void> {
		await storeValue(PreferencesKey.LOCALE, value);
		locale.set(value);
		setDefaultOptions({ locale: getDateFnsLocale(value) });
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

	function getDateFnsLocale(locale: Locale): DateFnsLocale {
		switch (locale) {
			case Locale.DE: {
				return de;
			}
			case Locale.EN: {
				return enUS;
			}
			default: {
				return enUS;
			}
		}
	}

	return {
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Store for locale.
 */
export const localeStore = createStore();
