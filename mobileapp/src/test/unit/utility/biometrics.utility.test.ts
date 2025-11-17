/* eslint-disable @typescript-eslint/no-explicit-any, sonarjs/no-hardcoded-passwords */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	deleteBiometricCredentials,
	getBiometricCredentials,
	isBiometricAvailable,
	isBiometricEnabled,
	storeBiometricCredentials,
	updateUsernameBiometricCredentials
} from '$lib/utility';

const keyFunction = (key: string): string => key;
const emptyFunction = (): void => {};

vi.mock('svelte/store', async (importOriginal) => {
	const actual = await importOriginal<typeof import('svelte/store')>();
	return {
		...actual,
		get: vi.fn(() => keyFunction)
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

vi.mock('$lib/utility', async () => {
	const actual = await vi.importActual('$lib/utility');
	return {
		...actual,
		getStoredValue: vi.fn(),
		showAlert: vi.fn(),
		storeValue: vi.fn()
	};
});

vi.mock('$lib/locales', () => {
	const mockStore = {
		subscribe: vi.fn((callback: any) => {
			callback(keyFunction);
			return emptyFunction;
		})
	};
	return { t: mockStore };
});

describe('biometrics.utility', () => {
	let mockNativeBiometric: any;
	let mockShowAlert: any;
	let mockGetStoredValue: any;
	let mockStoreValue: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
		mockNativeBiometric = NativeBiometric;

		const utility = await import('$lib/utility');
		mockShowAlert = utility.showAlert;
		mockGetStoredValue = utility.getStoredValue;
		mockStoreValue = utility.storeValue;
	});

	describe('isBiometricAvailable', () => {
		it('should return true when biometric is available', async () => {
			mockNativeBiometric.isAvailable.mockResolvedValue({
				errorCode: undefined,
				isAvailable: true
			});

			const result = await isBiometricAvailable();

			expect(result).toBe(true);
			expect(mockShowAlert).not.toHaveBeenCalled();
		});

		it('should return false when biometric has error', async () => {
			mockNativeBiometric.isAvailable.mockResolvedValue({
				errorCode: 'NOT_AVAILABLE',
				isAvailable: false
			});

			const result = await isBiometricAvailable();

			expect(result).toBe(false);
		});

		it('should return false on exception', async () => {
			mockNativeBiometric.isAvailable.mockRejectedValue(new Error('Failed'));

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
			mockGetStoredValue.mockResolvedValue();

			const result = await isBiometricEnabled();

			expect(result).toBe(false);
		});
	});

	describe('getBiometricCredentials', () => {
		it('should return credentials when available', async () => {
			mockNativeBiometric.getCredentials.mockResolvedValue({
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
			mockNativeBiometric.getCredentials.mockRejectedValue(new Error('Failed'));

			const result = await getBiometricCredentials();

			expect(result).toBeUndefined();
			expect(mockShowAlert).toHaveBeenCalled();
		});
	});

	describe('storeBiometricCredentials', () => {
		it('should store credentials successfully', async () => {
			mockNativeBiometric.setCredentials.mockResolvedValue();
			mockStoreValue.mockResolvedValue();

			await storeBiometricCredentials('testuser', 'testpass');

			expect(mockNativeBiometric.setCredentials).toHaveBeenCalledWith(
				expect.objectContaining({
					password: 'testpass',
					username: 'testuser'
				})
			);
			expect(mockStoreValue).toHaveBeenCalled();
		});

		it('should show alert on error', async () => {
			mockNativeBiometric.setCredentials.mockRejectedValue(new Error('Failed'));

			await storeBiometricCredentials('testuser', 'testpass');

			expect(mockShowAlert).toHaveBeenCalled();
		});
	});

	describe('updateUsernameBiometricCredentials', () => {
		it('should update username while keeping password', async () => {
			mockNativeBiometric.getCredentials.mockResolvedValue({
				password: 'testpass',
				username: 'olduser'
			});
			mockNativeBiometric.setCredentials.mockResolvedValue();

			await updateUsernameBiometricCredentials('newuser');

			expect(mockNativeBiometric.setCredentials).toHaveBeenCalledWith(
				expect.objectContaining({
					password: 'testpass',
					username: 'newuser'
				})
			);
		});
	});

	describe('deleteBiometricCredentials', () => {
		it('should delete credentials successfully', async () => {
			mockNativeBiometric.deleteCredentials.mockResolvedValue();
			mockStoreValue.mockResolvedValue();

			await deleteBiometricCredentials();

			expect(mockNativeBiometric.deleteCredentials).toHaveBeenCalled();
			expect(mockStoreValue).toHaveBeenCalledWith(expect.anything(), false);
		});
	});
});
