/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, hasStoredValue, removeStoredValue, storeValue } from '$lib/utility';

vi.mock('@capacitor/preferences', () => ({
	Preferences: {
		get: vi.fn(),
		remove: vi.fn(),
		set: vi.fn()
	}
}));

vi.mock('$lib/utility', async () => {
	const actual = await vi.importActual('$lib/utility');
	return {
		...actual,
		showAlert: vi.fn()
	};
});

describe('preferences.utility', () => {
	let mockPreferences: any;
	let mockShowAlert: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		const { Preferences } = await import('@capacitor/preferences');
		mockPreferences = Preferences;

		const utility = await import('$lib/utility');
		mockShowAlert = utility.showAlert;
	});

	describe('storeValue', () => {
		it('should store string value', async () => {
			mockPreferences.set.mockResolvedValue();

			await storeValue(PreferencesKey.LOCALE, 'en');

			expect(mockPreferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: '"en"'
				})
			);
		});

		it('should store object value', async () => {
			mockPreferences.set.mockResolvedValue();

			await storeValue(PreferencesKey.LOCALE, { lang: 'en' });

			expect(mockPreferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: JSON.stringify({ lang: 'en' })
				})
			);
		});

		it('should store boolean value', async () => {
			mockPreferences.set.mockResolvedValue();

			await storeValue(PreferencesKey.BIOMETRICS_ENABLED, true);

			expect(mockPreferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: 'true'
				})
			);
		});

		it('should show alert on error', async () => {
			mockPreferences.set.mockRejectedValue(new Error('Storage failed'));

			await storeValue(PreferencesKey.LOCALE, 'en');

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to store value');
		});
	});

	describe('getStoredValue', () => {
		it('should retrieve stored string value', async () => {
			mockPreferences.get.mockResolvedValue({ value: '"en"' });

			const result = await getStoredValue<string>(PreferencesKey.LOCALE);

			expect(result).toBe('en');
		});

		it('should retrieve stored object value', async () => {
			mockPreferences.get.mockResolvedValue({ value: '{"lang":"en"}' });

			const result = await getStoredValue<{ lang: string }>(PreferencesKey.LOCALE);

			expect(result).toEqual({ lang: 'en' });
		});

		it('should return undefined when value is null', async () => {
			mockPreferences.get.mockResolvedValue({ value: undefined });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toBeUndefined();
		});

		it('should return raw value when JSON parse fails', async () => {
			mockPreferences.get.mockResolvedValue({ value: 'not-json' });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe('not-json');
		});

		it('should show alert on error', async () => {
			mockPreferences.get.mockRejectedValue(new Error('Retrieval failed'));

			await getStoredValue(PreferencesKey.LOCALE);

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to retrieve value');
		});
	});

	describe('removeStoredValue', () => {
		it('should remove stored value', async () => {
			mockPreferences.remove.mockResolvedValue();

			await removeStoredValue(PreferencesKey.LOCALE);

			expect(mockPreferences.remove).toHaveBeenCalledWith(
				expect.objectContaining({
					key: expect.stringContaining(PreferencesKey.LOCALE)
				})
			);
		});

		it('should show alert on error', async () => {
			mockPreferences.remove.mockRejectedValue(new Error('Remove failed'));

			await removeStoredValue(PreferencesKey.LOCALE);

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to remove value');
		});
	});

	describe('hasStoredValue', () => {
		it('should return true when value exists', async () => {
			mockPreferences.get.mockResolvedValue({ value: '"en"' });

			const result = await hasStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe(true);
		});

		it('should return false when value is undefined', async () => {
			mockPreferences.get.mockResolvedValue({ value: undefined });

			const result = await hasStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe(false);
		});
	});
});
