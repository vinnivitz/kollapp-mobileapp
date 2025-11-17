/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatusCode } from '$lib/models/api';
import { StatusCheck } from '$lib/utility';

globalThis.fetch = vi.fn();

function registerMocks(): void {
	vi.mock('$lib/stores', () => ({
		appStateStore: { subscribe: vi.fn() },
		authenticationStore: { subscribe: vi.fn() },
		connectionStore: { check: vi.fn(), set: vi.fn(), subscribe: vi.fn() },
		localeStore: { subscribe: vi.fn() },
		organizationStore: { subscribe: vi.fn() },
		userStore: { subscribe: vi.fn() }
	}));

	vi.mock('$lib/utility', async () => {
		const actual = await vi.importActual('$lib/utility');
		return {
			...actual,
			getStoredValue: vi.fn(),
			removeStoredValue: vi.fn(),
			showAlert: vi.fn(),
			storeValue: vi.fn()
		};
	});

	vi.mock('$lib/locales', () => ({
		Locale: { DE: 'de', EN: 'en' },
		t: { subscribe: vi.fn() }
	}));
}

describe('api.utility', () => {
	beforeEach(() => {
		registerMocks();
		vi.clearAllMocks();
		(globalThis.fetch as any).mockResolvedValue({
			json: vi.fn().mockResolvedValue({ data: 'test' }),
			ok: true,
			status: 200
		});
	});

	describe('StatusCheck', () => {
		it('should check if status is OK', () => {
			expect(StatusCheck.isOK(200)).toBe(true);
			expect(StatusCheck.isOK(299)).toBe(true);
			expect(StatusCheck.isOK(StatusCode.BAD_REQUEST)).toBe(false);
		});

		it('should check if status is Unauthorized', () => {
			expect(StatusCheck.isUnauthorized(StatusCode.UNAUTHORIZED)).toBe(true);
			expect(StatusCheck.isUnauthorized(StatusCode.OK)).toBe(false);
		});

		it('should check if server is not reachable', () => {
			expect(StatusCheck.serverNotReachable(StatusCode.SERVICE_UNAVAILABLE)).toBe(true);
			expect(StatusCheck.serverNotReachable(StatusCode.OK)).toBe(false);
		});
	});
});
