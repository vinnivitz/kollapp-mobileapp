import { Device } from '@capacitor/device';

import { Locale, PreferencesKey } from '$lib/models';
import { getStoredValue } from '$lib/utils';

/**
 * Determines the current locale and returns it
 * @returns {Promise<Locale>}
 */
export async function determineLocale(): Promise<Locale> {
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
