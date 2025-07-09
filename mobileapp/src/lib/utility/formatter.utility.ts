import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { get } from 'svelte/store';

import { localeStore } from '$lib/stores';

/**
 * Formatter for form based currency input in €
 * @returns The formatter
 */
function currency(cents: number): string {
	const nf = new Intl.NumberFormat(get(localeStore), {
		currency: 'EUR',
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
		style: 'currency'
	});

	return nf.format(cents / 100);
}

/**
 * Formatter for form based currency input in €
 * @returns The formatter
 */
function date(value: string): string {
	return format(new TZDate(value), 'PPP');
}

export const formatter = { currency, date };
