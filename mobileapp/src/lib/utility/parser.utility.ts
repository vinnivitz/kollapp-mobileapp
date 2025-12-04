import { TZDate } from '@date-fns/tz';
import { format, parse } from 'date-fns';

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
 * Parses a date string in PPP format to YYYY-MM-DD format
 * @param value date string in PPP format
 * @returns date string in YYYY-MM-DD format
 */
function date(value: string): string {
	return format(parse(value, 'PPP', new TZDate()), 'yyyy-MM-dd');
}

function onlyDigits(value: string): string {
	return value.replaceAll(/\D/g, '');
}

export const parser = { currency, date };
