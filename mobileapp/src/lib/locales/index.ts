import type { Config } from 'sveltekit-i18n';

import I18n from 'sveltekit-i18n';

const config: Config<{ value?: number | string; value2?: number | string; value3?: number | string }> = {
	loaders: [
		{
			key: '',
			loader: async () => import('./en.json'),
			locale: 'en'
		},
		{
			key: '',
			loader: async () => import('./de.json'),
			locale: 'de'
		}
	]
};

/**
 * Locale enum for the supported languages.
 * @enum {string} Locale
 */
export enum Locale {
	DE = 'de',
	EN = 'en'
}

/**
 * I18n instance for managing translations and locale.
 * @constant {I18n} i18n
 */
export const { initialized, loadTranslations, locale, t } = new I18n(config);
