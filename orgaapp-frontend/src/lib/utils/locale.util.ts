import { Locale, PreferencesKey } from '$lib/models';
import { getStoredValue } from '$lib/utils';

/**
 * Determines the current locale and returns it
 * @returns {Promise<Locale>} locale
 */
export async function determineLocale(): Promise<Locale> {
	return (
		(await getStoredValue<Locale>(PreferencesKey.LOCALE)) ??
		getLocaleFromNavigator() ??
		(process.env.LOCALE as Locale | undefined) ??
		Locale.DE
	);
}

function getLocaleFromNavigator(): Locale | undefined {
	const locale = navigator?.language?.split('-')?.[0] as Locale | undefined;
	return locale && Object.values(Locale).includes(locale) ? locale : undefined;
}
