import type { Config } from 'sveltekit-i18n';
import I18n from 'sveltekit-i18n';

const config: Config<{ value?: string | number }> = {
	loaders: [
		{
			locale: 'en',
			key: '',
			loader: () => import('./en.json')
		},
		{
			locale: 'de',
			key: '',
			loader: () => import('./de.json')
		}
	]
};

/**
 * Locale enum for the supported languages.
 */
export enum Locale {
	DE = 'de',
	EN = 'en'
}

export const { t, locale, loadTranslations } = new I18n(config);
