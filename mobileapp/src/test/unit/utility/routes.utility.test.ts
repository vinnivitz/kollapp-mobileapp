/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { navigateBack } from '$lib/utility';

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

describe('routes.utility', () => {
	let mockModalStore: any;
	let mockGoto: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		const { goto } = await import('$app/navigation');
		mockGoto = goto;
		mockGoto.mockResolvedValue();

		const { modalStore } = await import('$lib/stores');
		mockModalStore = modalStore;
		mockModalStore.closeLastIfExists.mockReturnValue(false);

		// Reset history mock
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
			mockModalStore.closeLastIfExists.mockReturnValue(true);

			await navigateBack();

			expect(mockGoto).not.toHaveBeenCalled();
			expect(history.back).not.toHaveBeenCalled();
		});

		it('should call history.back when history length > 1', async () => {
			await navigateBack();

			expect(history.back).toHaveBeenCalled();
			expect(mockGoto).not.toHaveBeenCalled();
		});

		it('should navigate to parent path when no history', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/test/path';

			await navigateBack();

			expect(mockGoto).toHaveBeenCalledWith('/test', { replaceState: true });
		});

		it('should navigate to root when at single segment', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/test';

			await navigateBack();

			expect(mockGoto).toHaveBeenCalledWith('/', { replaceState: true });
		});

		it('should not navigate when already at root with no history', async () => {
			Object.defineProperty(globalThis, 'history', {
				value: { back: vi.fn(), length: 1 },
				writable: true
			});

			const { page } = await import('$app/state');
			(page as any).url.pathname = '/';

			await navigateBack();

			expect(mockGoto).not.toHaveBeenCalled();
		});

		it('should navigate to root on non-browser environment', async () => {
			const environmentModule = await import('$app/environment');
			vi.mocked(environmentModule).browser = false;

			await navigateBack();

			expect(mockGoto).toHaveBeenCalledWith('/');
		});
	});
});
