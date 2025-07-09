import { TZDate } from '@date-fns/tz';
import { format, parse } from 'date-fns';

/**
 * Parser for form based currency input in €
 * @returns The parser
 */
function currency(value: string): number {
	const digits = value.replaceAll(/\D/g, '');
	const padded = digits.padStart(3, '0');
	const eurosPart = padded.slice(0, -2);
	const centsPart = padded.slice(-2);
	return Number.parseInt(eurosPart, 10) * 100 + Number.parseInt(centsPart, 10);
}

function date(value: string): string {
	return format(parse(value, 'PPP', new TZDate()), 'yyyy-MM-dd');
}

export const parser = { currency, date };
