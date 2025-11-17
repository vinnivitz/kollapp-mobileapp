import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearRequestCache, deduplicateRequest } from '$lib/utility';

describe('request-cache.utility', () => {
	beforeEach(() => {
		clearRequestCache();
		vi.clearAllMocks();
	});

	describe('deduplicateRequest', () => {
		it('should execute request function when no cached request exists', async () => {
			const requestFunction = vi.fn().mockResolvedValue('result');

			const result = await deduplicateRequest('test-key', requestFunction);

			expect(result).toBe('result');
			expect(requestFunction).toHaveBeenCalledTimes(1);
		});

		it('should return cached promise for concurrent requests with same key', async () => {
			let resolveRequest: (value: string) => void;
			const requestPromise = new Promise<string>((resolve) => {
				resolveRequest = resolve;
			});
			const requestFunction = vi.fn().mockReturnValue(requestPromise);

			const promise1 = deduplicateRequest('test-key', requestFunction);
			const promise2 = deduplicateRequest('test-key', requestFunction);

			expect(requestFunction).toHaveBeenCalledTimes(1);

			resolveRequest!('result');

			const result1 = await promise1;
			const result2 = await promise2;

			expect(result1).toBe('result');
			expect(result2).toBe('result');
			expect(promise1).toBe(promise2);
		});

		it('should not cache requests with different keys', async () => {
			const requestFunction1 = vi.fn().mockResolvedValue('result1');
			const requestFunction2 = vi.fn().mockResolvedValue('result2');

			const result1 = await deduplicateRequest('key1', requestFunction1);
			const result2 = await deduplicateRequest('key2', requestFunction2);

			expect(result1).toBe('result1');
			expect(result2).toBe('result2');
			expect(requestFunction1).toHaveBeenCalledTimes(1);
			expect(requestFunction2).toHaveBeenCalledTimes(1);
		});

		it('should clear cache after TTL expires', async () => {
			vi.useFakeTimers();
			const requestFunction = vi.fn().mockResolvedValue('result');

			await deduplicateRequest('test-key', requestFunction, 1000);
			expect(requestFunction).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(1100);

			await deduplicateRequest('test-key', requestFunction, 1000);
			expect(requestFunction).toHaveBeenCalledTimes(2);

			vi.useRealTimers();
		});

		it('should handle request errors properly', async () => {
			const error = new Error('Request failed');
			const requestFunction = vi.fn().mockRejectedValue(error);

			await expect(deduplicateRequest('test-key', requestFunction)).rejects.toThrow('Request failed');
			expect(requestFunction).toHaveBeenCalledTimes(1);
		});

		it('should use default TTL of 1000ms when not specified', async () => {
			vi.useFakeTimers();
			const requestFunction = vi.fn().mockResolvedValue('result');

			await deduplicateRequest('test-key', requestFunction);

			vi.advanceTimersByTime(500);
			await deduplicateRequest('test-key', requestFunction);
			expect(requestFunction).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(600);
			await deduplicateRequest('test-key', requestFunction);
			expect(requestFunction).toHaveBeenCalledTimes(2);

			vi.useRealTimers();
		});
	});

	describe('clearRequestCache', () => {
		it('should clear all pending requests', async () => {
			const requestFunction = vi.fn().mockResolvedValue('result');

			await deduplicateRequest('key1', requestFunction);
			await deduplicateRequest('key2', requestFunction);

			clearRequestCache();

			await deduplicateRequest('key1', requestFunction);
			await deduplicateRequest('key2', requestFunction);

			expect(requestFunction).toHaveBeenCalledTimes(4);
		});
	});
});
