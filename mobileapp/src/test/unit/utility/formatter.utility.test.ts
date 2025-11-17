import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatter } from '$lib/utility';

const arrowFunction = (): void => {};

vi.mock('$lib/stores', () => ({
	localeStore: {
		subscribe: vi.fn((callback) => {
			callback('de');
			return arrowFunction;
		})
	}
}));

describe('formatter.utility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('currency', () => {
		it('should format cents to currency without cents by default', () => {
			const result = formatter.currency(12_345);
			expect(result).toContain('123');
		});

		it('should format cents to currency with cents when showCents is true', () => {
			const result = formatter.currency(12_345, true);
			expect(result).toContain('123');
			expect(result).toContain('45');
		});

		it('should format zero correctly', () => {
			const result = formatter.currency(0);
			expect(result).toContain('0');
		});

		it('should format negative values correctly', () => {
			const result = formatter.currency(-5000, true);
			expect(result).toContain('50');
			expect(result).toContain('-');
		});

		it('should handle large numbers', () => {
			const result = formatter.currency(123_456_789);
			expect(result).toBeTruthy();
			expect(result.replaceAll('D', '')).toContain('1234567');
		});

		it('should round cents appropriately when showCents is false', () => {
			const result = formatter.currency(12_399, false);
			expect(result).toContain('123');
		});
	});

	describe('date', () => {
		it('should format date string', () => {
			const result = formatter.date('2024-01-15T10:30:00Z');
			expect(result).toBeTruthy();
			expect(typeof result).toBe('string');
		});

		it('should format ISO date string', () => {
			const result = formatter.date('2024-12-25T00:00:00Z');
			expect(result).toBeTruthy();
		});

		it('should handle different date formats', () => {
			const result = formatter.date('2024-06-01T12:00:00Z');
			expect(result).toBeTruthy();
			expect(result.length).toBeGreaterThan(0);
		});
	});
});
