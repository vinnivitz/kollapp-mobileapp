import type { LoginRequestTO } from '@kollapp/api-types';

import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { get } from 'svelte/store';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { getStoredValue, showAlert, storeValue } from '$lib/utility';

const $t = get(t);

const BIOMETRICS_SERVER = 'kollapp.biometrics.credentials';

/**
 * Checks if biometric authentication is available on the device.
 * @returns {Promise<boolean>} - Returns true if biometric authentication is available, false otherwise.
 */
export async function isBiometricAvailable(): Promise<boolean> {
	try {
		const result = await NativeBiometric.isAvailable();
		if (result.errorCode) {
			await showAlert($t('utility.biometrics.not-available'));
		}
		return result.isAvailable;
	} catch {
		return false;
	}
}

/**
 * Checks if biometric authentication is enabled on the device.
 * @returns {Promise<boolean>} - Returns true if biometric authentication is enabled, false otherwise.
 */
export async function isBiometricEnabled(): Promise<boolean> {
	return (await getStoredValue<boolean>(StorageKey.BIOMETRICS_ENABLED)) ?? false;
}

/**
 * Retrieves the biometric credentials stored on the device.
 * @returns {Promise<LoginRequestTO | undefined>} - Returns the credentials if available, otherwise undefined.
 */
export async function getBiometricCredentials(): Promise<LoginRequestTO | undefined> {
	try {
		const result = await NativeBiometric.getCredentials({ server: BIOMETRICS_SERVER });
		return { password: result.password, username: result.username } satisfies LoginRequestTO;
	} catch {
		await showAlert($t('utility.biometrics.not-available'));
		return undefined;
	}
}

/**
 * Stores the biometric credentials on the device.
 * @param {string} username - The username to store.
 * @param {string} password - The password to store.
 * @returns {Promise<void>}
 */
export async function storeBiometricCredentials(username: string, password: string): Promise<void> {
	try {
		await NativeBiometric.setCredentials({
			password,
			server: BIOMETRICS_SERVER,
			username
		});
		await storeValue(StorageKey.BIOMETRICS_ENABLED, true);
	} catch {
		await showAlert($t('utility.biometrics.not-available'));
	}
}

/**
 * Updates the username in the biometric credentials stored on the device.
 * @param {string} username - The new username to store.
 * @returns {Promise<void>}
 */
export async function updateUsernameBiometricCredentials(username: string): Promise<void> {
	try {
		const result = await NativeBiometric.getCredentials({ server: BIOMETRICS_SERVER });
		await NativeBiometric.setCredentials({
			password: result.password,
			server: BIOMETRICS_SERVER,
			username
		});
	} catch {
		await showAlert($t('utility.biometrics.not-available'));
	}
}

/**
 * Updates the password in the biometric credentials stored on the device.
 * @param {string} password - The new password to store.
 * @returns {Promise<void>}
 */
export async function updatePasswordBiometricCredentials(password: string): Promise<void> {
	try {
		const result = await NativeBiometric.getCredentials({ server: BIOMETRICS_SERVER });
		await NativeBiometric.setCredentials({
			password,
			server: BIOMETRICS_SERVER,
			username: result.username
		});
	} catch {
		await showAlert($t('utility.biometrics.not-available'));
	}
}

/**
 * Deletes the biometric credentials from the device.
 * @returns {Promise<void>}
 */
export async function deleteBiometricCredentials(): Promise<void> {
	try {
		await NativeBiometric.deleteCredentials({ server: BIOMETRICS_SERVER });
		await storeValue(StorageKey.BIOMETRICS_ENABLED, false);
	} catch {
		await showAlert($t('utility.biometrics.not-available'));
	}
}

/**
 * Prompts biometric authentication from the user.
 * @returns {Promise<LoginRequestTO | undefined>} - Returns the credentials if authentication is successful, otherwise undefined.
 */
export async function promptBiometricAuthentication(): Promise<LoginRequestTO | undefined> {
	await NativeBiometric.verifyIdentity({
		maxAttempts: environment.maxBiometricAuthRetries,
		negativeButtonText: $t('utility.biometrics.prompt.cancel'),
		subtitle: $t('utility.biometrics.prompt.subtitle'),
		title: $t('utility.biometrics.prompt.title')
	});
	return getBiometricCredentials();
}
