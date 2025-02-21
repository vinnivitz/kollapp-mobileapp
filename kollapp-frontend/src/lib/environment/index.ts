const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const networkCheckInterval = Number.parseInt(import.meta.env.VITE_NETWORK_CHECK_INTERVAL) || 10_000;
const preferencesPrefix = import.meta.env.VITE_PREFERENCES_PREFIX || 'kollapp';

export default { apiUrl, networkCheckInterval, preferencesPrefix };
