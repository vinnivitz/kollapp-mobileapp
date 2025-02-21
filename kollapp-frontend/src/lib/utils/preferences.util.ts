import { Preferences } from '@capacitor/preferences';

import environment from '$lib/environment';
import type { PreferencesKey } from '$lib/models/preferences';

/**
 * Stores a value in the preferences store
 * @param key key name
 * @param value value to store
 * @returns {Promise<void>}
 */
export async function storeValue<T>(key: PreferencesKey, value: T): Promise<void> {
	await Preferences.set({ key: getKey(key), value: JSON.stringify(value) });
}

/**
 * Retrieves a value from the preferences store or returns `undefined` if not found
 * @param key key name
 * @returns {Promise<T | undefined>}
 */
export async function getStoredValue<T = string>(key: PreferencesKey): Promise<T | undefined> {
	const result = await Preferences.get({ key: getKey(key) });
	const value = result.value ?? undefined;
	try {
		return value ? (JSON.parse(value) as T) : undefined;
	} catch {
		return value as T;
	}
}

/**
 * Removes a value from the preferences store
 * @param key key name
 * @returns {Promise<void>}
 */
export async function removeStoredValue(key: PreferencesKey): Promise<void> {
	await Preferences.remove({ key: getKey(key) });
}

/**
 * Checks if a value is stored for the given key
 * @param key key name
 * @returns {Promise<boolean>}
 */
export async function hasStoredValue(key: PreferencesKey): Promise<boolean> {
	return (await getStoredValue(key)) !== undefined;
}

function getKey(key: PreferencesKey): string {
	return `${environment.preferencesPrefix}.${key}`;
}
