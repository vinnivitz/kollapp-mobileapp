import { TZDate } from '@date-fns/tz';

import { formatter } from './formatter.utility';

/**
 * Parser for form based currency input in €
 * @returns The parser
 */
function currency(value: string): number {
	const trimmed = (value ?? '').trim();
	if (trimmed.length === 0) return 0;

	const lastComma = trimmed.lastIndexOf(',');
	const lastDot = trimmed.lastIndexOf('.');
	const separationIndex = Math.max(lastComma, lastDot);

	if (separationIndex === -1) {
		const euros = onlyDigits(trimmed);
		return euros.length > 0 ? Number.parseInt(euros, 10) * 100 : 0;
	}

	const eurosString = onlyDigits(trimmed.slice(0, separationIndex));
	const decimalsString = onlyDigits(trimmed.slice(separationIndex + 1)).slice(0, 2);

	const euros = eurosString.length > 0 ? Number.parseInt(eurosString, 10) : 0;
	const decimals = decimalsString.length > 0 ? Number.parseInt(decimalsString.padEnd(2, '0'), 10) : 0;

	return euros * 100 + decimals;
}

/**
 * Parser for form based date input in yyyy-MM-dd
 * @param value date
 * @returns The parser
 */
function date(value: Date | string | TZDate | undefined): string {
	if (typeof value === 'string') {
		value = new TZDate(value);
	} else if (!value) {
		value = new TZDate();
	}
	return formatter.date(value, 'yyyy-MM-dd');
}

function onlyDigits(value: string): string {
	return value.replaceAll(/\D/g, '');
}

export const parser = { currency, date };
