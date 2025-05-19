const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const networkCheckInterval = Number.parseInt(import.meta.env.VITE_NETWORK_CHECK_INTERVAL) || 10_000;
const preferencesPrefix = import.meta.env.VITE_PREFERENCES_PREFIX || 'kollapp';
const defaultPosition = import.meta.env.VITE_DEFAULT_POSITION || '[51.054151, 13.736878]';

export default { apiUrl, defaultPosition, networkCheckInterval, preferencesPrefix };
