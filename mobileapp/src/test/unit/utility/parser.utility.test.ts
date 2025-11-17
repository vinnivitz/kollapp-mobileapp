import { describe, expect, it } from 'vitest';

import { parser } from '$lib/utility';

describe('parser.utility', () => {
	describe('currency', () => {
		it('should parse empty string to 0', () => {
			expect(parser.currency('')).toBe(0);
			expect(parser.currency('   ')).toBe(0);
		});

		it('should parse integers as euros to cents', () => {
			expect(parser.currency('123')).toBe(12_300);
			expect(parser.currency('1')).toBe(100);
		});

		it('should parse comma decimal separator', () => {
			expect(parser.currency('123,45')).toBe(12_345);
			expect(parser.currency('1,50')).toBe(150);
			expect(parser.currency('0,99')).toBe(99);
		});

		it('should parse dot decimal separator', () => {
			expect(parser.currency('123.45')).toBe(12_345);
			expect(parser.currency('1.50')).toBe(150);
			expect(parser.currency('0.99')).toBe(99);
		});

		it('should handle thousand separators with comma decimal', () => {
			expect(parser.currency('1.234,56')).toBe(123_456);
			expect(parser.currency('12.345.678,90')).toBe(1_234_567_890);
		});

		it('should handle thousand separators with dot decimal', () => {
			expect(parser.currency('1,234.56')).toBe(123_456);
			expect(parser.currency('12,345,678.90')).toBe(1_234_567_890);
		});

		it('should only take first 2 decimal digits', () => {
			expect(parser.currency('123,456')).toBe(12_345);
			expect(parser.currency('1.999')).toBe(199);
		});

		it('should handle single decimal digit by padding', () => {
			expect(parser.currency('123,4')).toBe(12_340);
			expect(parser.currency('1.5')).toBe(150);
		});

		it('should ignore non-numeric characters', () => {
			expect(parser.currency('€123,45')).toBe(12_345);
			expect(parser.currency('$ 1,234.56 USD')).toBe(123_456);
		});

		it('should handle edge case with only decimal part', () => {
			expect(parser.currency(',99')).toBe(99);
			expect(parser.currency('.50')).toBe(50);
		});

		it('should handle missing decimal part after separator', () => {
			expect(parser.currency('123,')).toBe(12_300);
			expect(parser.currency('456.')).toBe(45_600);
		});
	});

	describe('date', () => {
		it('should parse date in PPP format to YYYY-MM-DD', () => {
			const result = parser.date('March 15, 2024');
			expect(result).toBe('2024-03-15');
		});

		it('should handle different PPP formatted dates', () => {
			const result = parser.date('December 25, 2023');
			expect(result).toBe('2023-12-25');
		});

		it('should handle single-digit days', () => {
			const result = parser.date('January 1, 2024');
			expect(result).toBe('2024-01-01');
		});
	});
});
