import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';

import { Currency } from '$lib/models/ui';
import { localeStore } from '$lib/stores';

/**
 * Formatter for form based currency input in €
 * @returns The formatter
 */
function currency(cents: number, showCents = false): string {
	const numberFormat = new Intl.NumberFormat(get(localeStore) ?? 'de', {
		currency: Currency.EUR,
		maximumFractionDigits: 2,
		minimumFractionDigits: showCents ? 2 : 0,
		style: 'currency'
	});
	return numberFormat.format(cents / 100);
}

/**
 * Formatter for form based currency input in €
 * @returns The formatter
 */
function date(value: string): string {
	return format(new TZDate(value), 'PPP');
}

export const formatter = { currency, date };
