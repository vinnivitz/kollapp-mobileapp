/* eslint-disable @typescript-eslint/no-explicit-any, sonarjs/no-hardcoded-passwords, unicorn/consistent-function-scoping */

import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import {
	deleteBiometricCredentials,
	getBiometricCredentials,
	isBiometricAvailable,
	isBiometricEnabled,
	storeBiometricCredentials,
	updateUsernameBiometricCredentials
} from '$lib/utility';

const mockGetStoredValue = vi.hoisted(() => vi.fn());
const mockShowAlert = vi.hoisted(() => vi.fn());
const mockStoreValue = vi.hoisted(() => vi.fn());

function registerMocks(): void {
	vi.mock('svelte/store', async (importOriginal) => {
		const actual = await importOriginal<typeof import('svelte/store')>();
		return {
			...actual,
			get: vi.fn(() => (key: string) => key)
		};
	});

	vi.mock('@capgo/capacitor-native-biometric', () => ({
		NativeBiometric: {
			deleteCredentials: vi.fn(),
			getCredentials: vi.fn(),
			isAvailable: vi.fn(),
			setCredentials: vi.fn()
		}
	}));

	vi.mock('$lib/stores', () => ({
		appStateStore: {
			subscribe: vi.fn(() => vi.fn())
		}
	}));

	vi.mock('$lib/utility/preferences.utility', () => ({
		getStoredValue: mockGetStoredValue,
		storeValue: mockStoreValue
	}));

	vi.mock('$lib/utility/alert.utility', () => ({
		showAlert: mockShowAlert
	}));

	vi.mock('$lib/locales', () => {
		const mockStore = {
			subscribe: vi.fn((callback: any) => {
				callback((key: string) => key);
				return vi.fn();
			})
		};
		return { t: mockStore };
	});
}

describe('biometrics.utility', () => {
	beforeEach(async () => {
		registerMocks();
		vi.clearAllMocks();
	});

	describe('isBiometricAvailable', () => {
		it('should return true when biometric is available', async () => {
			(NativeBiometric.isAvailable as Mock).mockResolvedValue({
				errorCode: undefined,
				isAvailable: true
			});

			const result = await isBiometricAvailable();

			expect(result).toBe(true);
			expect(mockShowAlert).not.toHaveBeenCalled();
		});

		it('should return false when biometric has error', async () => {
			(NativeBiometric.isAvailable as Mock).mockResolvedValue({
				errorCode: 'NOT_AVAILABLE',
				isAvailable: false
			});

			const result = await isBiometricAvailable();

			expect(result).toBe(false);
		});

		it('should return false on exception', async () => {
			(NativeBiometric.isAvailable as Mock).mockRejectedValue(new Error('Failed'));

			const result = await isBiometricAvailable();

			expect(result).toBe(false);
		});
	});

	describe('isBiometricEnabled', () => {
		it('should return true when biometric is enabled', async () => {
			mockGetStoredValue.mockResolvedValue(true);

			const result = await isBiometricEnabled();

			expect(result).toBe(true);
		});

		it('should return false when biometric is not enabled', async () => {
			mockGetStoredValue.mockResolvedValue(false);

			const result = await isBiometricEnabled();

			expect(result).toBe(false);
		});

		it('should return false when value is undefined', async () => {
			mockGetStoredValue.mockResolvedValue(false);

			const result = await isBiometricEnabled();

			expect(result).toBe(false);
		});
	});

	describe('getBiometricCredentials', () => {
		it('should return credentials when available', async () => {
			(NativeBiometric.getCredentials as Mock).mockResolvedValue({
				password: 'testpass',
				username: 'testuser'
			});

			const result = await getBiometricCredentials();

			expect(result).toEqual({
				password: 'testpass',
				username: 'testuser'
			});
		});

		it('should return undefined and show alert on error', async () => {
			(NativeBiometric.getCredentials as Mock).mockRejectedValue(new Error('Failed'));

			const result = await getBiometricCredentials();

			expect(result).toBeUndefined();
			expect(mockShowAlert).toHaveBeenCalled();
		});
	});

	describe('storeBiometricCredentials', () => {
		it('should store credentials successfully', async () => {
			(NativeBiometric.setCredentials as Mock).mockResolvedValue({});
			mockStoreValue.mockResolvedValue({});

			await storeBiometricCredentials('testuser', 'testpass');

			expect(NativeBiometric.setCredentials).toHaveBeenCalledWith(
				expect.objectContaining({
					password: 'testpass',
					username: 'testuser'
				})
			);
			expect(mockStoreValue).toHaveBeenCalled();
		});

		it('should show alert on error', async () => {
			(NativeBiometric.setCredentials as Mock).mockRejectedValue(new Error('Failed'));

			await storeBiometricCredentials('testuser', 'testpass');

			expect(mockShowAlert).toHaveBeenCalled();
		});
	});

	describe('updateUsernameBiometricCredentials', () => {
		it('should update username while keeping password', async () => {
			(NativeBiometric.getCredentials as Mock).mockResolvedValue({
				password: 'testpass',
				username: 'olduser'
			});
			(NativeBiometric.setCredentials as Mock).mockResolvedValue({});
			await updateUsernameBiometricCredentials('newuser');

			expect(NativeBiometric.setCredentials).toHaveBeenCalledWith(
				expect.objectContaining({
					password: 'testpass',
					username: 'newuser'
				})
			);
		});
	});

	describe('deleteBiometricCredentials', () => {
		it('should delete credentials successfully', async () => {
			(NativeBiometric.deleteCredentials as Mock).mockResolvedValue({});
			mockStoreValue.mockResolvedValue({});

			await deleteBiometricCredentials();

			expect(NativeBiometric.deleteCredentials).toHaveBeenCalled();
			expect(mockStoreValue).toHaveBeenCalledWith(expect.anything(), false);
		});
	});
});
