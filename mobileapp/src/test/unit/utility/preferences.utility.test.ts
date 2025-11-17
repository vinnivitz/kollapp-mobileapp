import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, hasStoredValue, removeStoredValue, storeValue } from '$lib/utility';

const mockShowAlert = vi.hoisted(() => vi.fn());

function registerMocks(): void {
	vi.mock('@capacitor/preferences', () => ({
		Preferences: {
			get: vi.fn(),
			remove: vi.fn(),
			set: vi.fn()
		}
	}));

	vi.mock('$lib/stores', () => ({
		appStateStore: {
			subscribe: vi.fn(() => vi.fn())
		}
	}));

	vi.mock('$lib/utility/alert.utility', () => ({
		showAlert: mockShowAlert
	}));
}

describe('preferences.utility', () => {
	beforeEach(async () => {
		registerMocks();
		vi.clearAllMocks();
	});

	describe('storeValue', () => {
		it('should store string value', async () => {
			(Preferences.set as Mock).mockResolvedValue({});

			await storeValue(PreferencesKey.LOCALE, 'en');

			expect(Preferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: '"en"'
				})
			);
		});

		it('should store object value', async () => {
			(Preferences.set as Mock).mockResolvedValue({});

			await storeValue(PreferencesKey.LOCALE, { lang: 'en' });

			expect(Preferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: JSON.stringify({ lang: 'en' })
				})
			);
		});

		it('should store boolean value', async () => {
			(Preferences.set as Mock).mockResolvedValue({});

			await storeValue(PreferencesKey.BIOMETRICS_ENABLED, true);

			expect(Preferences.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: 'true'
				})
			);
		});

		it('should show alert on error', async () => {
			(Preferences.set as Mock).mockRejectedValue(new Error('Storage failed'));

			await storeValue(PreferencesKey.LOCALE, 'en');

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to store value');
		});
	});

	describe('getStoredValue', () => {
		it('should retrieve stored string value', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: '"en"' });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe('en');
		});

		it('should retrieve stored object value', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: '{"lang":"en"}' });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toEqual({ lang: 'en' });
		});

		it('should return undefined when value is null', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: undefined });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toBeUndefined();
		});

		it('should return raw value when JSON parse fails', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: 'not-json' });

			const result = await getStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe('not-json');
		});

		it('should show alert on error', async () => {
			(Preferences.get as Mock).mockRejectedValue(new Error('Retrieval failed'));

			await getStoredValue(PreferencesKey.LOCALE);

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to retrieve value');
		});
	});

	describe('removeStoredValue', () => {
		it('should remove stored value', async () => {
			(Preferences.remove as Mock).mockResolvedValue({});

			await removeStoredValue(PreferencesKey.LOCALE);

			expect(Preferences.remove).toHaveBeenCalledWith(
				expect.objectContaining({
					key: expect.stringContaining(PreferencesKey.LOCALE)
				})
			);
		});

		it('should show alert on error', async () => {
			(Preferences.remove as Mock).mockRejectedValue(new Error('Remove failed'));

			await removeStoredValue(PreferencesKey.LOCALE);

			expect(mockShowAlert).toHaveBeenCalledWith('Failed to remove value');
		});
	});

	describe('hasStoredValue', () => {
		it('should return true when value exists', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: '"en"' });

			const result = await hasStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe(true);
		});

		it('should return false when value is undefined', async () => {
			(Preferences.get as Mock).mockResolvedValue({ value: undefined });

			const result = await hasStoredValue(PreferencesKey.LOCALE);

			expect(result).toBe(false);
		});
	});
});
