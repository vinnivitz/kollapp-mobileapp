import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';

import { Currency } from '$lib/models/ui';
import { localeStore } from '$lib/stores';

/**
 * Formatter for form based currency input in €
 * @returns The formatter
 */
function currency(cents: number, hideCents = false): string {
	const numberFormat = new Intl.NumberFormat(get(localeStore) ?? 'de', {
		currency: Currency.EUR,
		maximumFractionDigits: hideCents ? 0 : 2,
		minimumFractionDigits: hideCents ? 0 : 2,
		style: 'currency'
	});

	return numberFormat.format(cents / 100);
}

/**
 * Formatter for form based currency input in €
 * @param value date string in PPP format
 * @param formatStr the format string, defaults to 'PPP'
 * @returns The formatter
 */
function date(value: Date | string | TZDate | undefined, formatString = 'PPP'): string {
	if (typeof value === 'string') {
		value = new TZDate(value);
	} else if (!value) {
		value = new TZDate();
	}
	return format(value, formatString);
}

export const formatter = { currency, date };
