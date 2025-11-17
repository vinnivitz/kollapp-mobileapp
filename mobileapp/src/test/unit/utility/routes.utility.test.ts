/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { goto } from '$app/navigation';

import { modalStore } from '$lib/stores';
import { navigateBack } from '$lib/utility';

function registerMocks(): void {
	vi.mock('$app/environment', () => ({
		browser: true
	}));

	vi.mock('$app/navigation', () => ({
		goto: vi.fn()
	}));

	vi.mock('$app/paths', () => ({
		resolve: vi.fn((path: string) => path)
	}));

	vi.mock('$app/state', () => ({
		page: {
			url: {
				pathname: '/test/path'
			}
		}
	}));

	vi.mock('$lib/stores', () => ({
		modalStore: {
			closeLastIfExists: vi.fn(() => false)
		}
	}));
}

describe('routes.utility', () => {
	beforeEach(async () => {
		registerMocks();
		vi.clearAllMocks();

		(modalStore.closeLastIfExists as Mock).mockReturnValue(false);

		Object.defineProperty(globalThis, 'history', {
			value: {
				back: vi.fn(),
				length: 2
			},
			writable: true
		});
	});

	describe('navigateBack', () => {
		it('should return early if modal is closed', async () => {
			(modalStore.closeLastIfExists as Mock).mockReturnValue(true);

			await navigateBack();

			expect(goto).not.toHaveBeenCalled();
			expect(history.back).not.toHaveBeenCalled();
		});

		it('should call history.back when history length > 1', async () => {
			await navigateBack();

			expect(history.back).toHaveBeenCalled();
			expect(goto).not.toHaveBeenCalled();
		});

		it('should navigate to parent path when no history', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/test/path';

			await navigateBack();

			expect(goto).toHaveBeenCalledWith('/test', { replaceState: true });
		});

		it('should navigate to root when at single segment', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/test';

			await navigateBack();

			expect(goto).toHaveBeenCalledWith('/', { replaceState: true });
		});

		it('should not navigate when already at root with no history', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/';

			await navigateBack();

			expect(goto).not.toHaveBeenCalled();
		});

		it('should navigate to root on non-browser environment', async () => {
			const environmentModule = await import('$app/environment');
			vi.mocked(environmentModule).browser = false;

			await navigateBack();

			expect(goto).toHaveBeenCalledWith('/');
		});
	});
});
