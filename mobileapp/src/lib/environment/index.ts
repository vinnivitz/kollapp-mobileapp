const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const networkCheckInterval = Number.parseInt(import.meta.env.VITE_NETWORK_CHECK_INTERVAL) || 10_000;
const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || 'kollapp';
const defaultPosition = import.meta.env.VITE_DEFAULT_POSITION || '[51.054151, 13.736878]';
const maxBiometricAuthRetries = Number.parseInt(import.meta.env.VITE_MAX_BIOMETRIC_AUTH_RETRIES) || 3;
const toastDuration = Number.parseInt(import.meta.env.VITE_TOAST_DURATION) || 3000;

export default {
	apiUrl,
	defaultPosition,
	maxBiometricAuthRetries,
	networkCheckInterval,
	storagePrefix,
	toastDuration
};
