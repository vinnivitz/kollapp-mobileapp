import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { get } from 'svelte/store';

import { dev } from '$app/environment';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { type StorageKey, StorageStrategy } from '$lib/models/storage';
import { showAlert } from '$lib/utility';

const $t = get(t);

/**
 * Stores a value in the preferences store
 * @param key key name
 * @param strategy storage strategy to use
 * @param value value to store
 * @returns {Promise<void>}
 */
export async function storeValue<T>(key: StorageKey, value: T, strategy = StorageStrategy.DEFAULT): Promise<void> {
	try {
		const deviceInfo = await Device.getInfo();
		if (strategy === StorageStrategy.SECURE && !dev && deviceInfo.platform !== 'web') {
			const success = await SecureStoragePlugin.set({ key: getKey(key), value: JSON.stringify(value) });
			if (!success) {
				await showAlert($t('utility.preferences.failure.store'));
			}
		} else {
			await Preferences.set({ key: getKey(key), value: JSON.stringify(value) });
		}
	} catch {
		await showAlert($t('utility.preferences.failure.store'));
	}
}

/**
 * Retrieves a value from the preferences store or returns `undefined` if not found
 * @param key key name
 * @param strategy storage strategy to use
 * @returns {Promise<T | undefined>}
 */
export async function getStoredValue<T = string>(
	key: StorageKey,
	strategy = StorageStrategy.DEFAULT
): Promise<T | undefined> {
	try {
		const deviceInfo = await Device.getInfo();
		const result = await (strategy === StorageStrategy.SECURE && !dev && deviceInfo.platform !== 'web'
			? SecureStoragePlugin.get({ key: getKey(key) })
			: Preferences.get({ key: getKey(key) }));
		const value = result.value ?? undefined;

		if (!value) return undefined;

		try {
			return value ? (JSON.parse(value) as T) : undefined;
		} catch {
			return value as T;
		}
	} catch {
		await showAlert($t('utility.preferences.failure.retreive'));
	}
}

/**
 * Removes a value from the preferences store
 * @param key key name
 * @param strategy storage strategy to use
 * @returns {Promise<void>}
 */
export async function removeStoredValue(key: StorageKey, strategy = StorageStrategy.DEFAULT): Promise<void> {
	try {
		const deviceInfo = await Device.getInfo();
		if (strategy === StorageStrategy.SECURE && !dev && deviceInfo.platform !== 'web') {
			const success = await SecureStoragePlugin.remove({ key: getKey(key) });
			if (!success) {
				await showAlert($t('utility.preferences.failure.remove'));
			}
		} else {
			await Preferences.remove({ key: getKey(key) });
		}
	} catch {
		await showAlert($t('utility.preferences.failure.remove'));
	}
}

/**
 * Checks if a value is stored for the given key
 * @param key key name
 * @param strategy storage strategy to use
 * @returns {Promise<boolean>}
 */
export async function hasStoredValue(key: StorageKey, strategy = StorageStrategy.DEFAULT): Promise<boolean> {
	return (await getStoredValue(key, strategy)) !== undefined;
}

function getKey(key: StorageKey): string {
	return `${environment.preferencesPrefix}.${key}`;
}
