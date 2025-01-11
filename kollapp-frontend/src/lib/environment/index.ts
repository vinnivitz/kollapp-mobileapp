const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const networkCheckInterval = parseInt(import.meta.env.VITE_NETWORK_CHECK_INTERVAL) || 10_000;

export default { apiUrl, networkCheckInterval };
