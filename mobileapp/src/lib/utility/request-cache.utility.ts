import { dev } from '$app/environment';

/**
 * Map to store pending requests by key
 */
const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicates concurrent requests to prevent multiple parallel calls to the same endpoint.
 * If a request with the same key is already pending, returns the existing promise.
 * After completion or TTL expiry, the request is removed from cache.
 *
 * @param key - Unique identifier for the request (e.g., 'user-store-init', 'org-123')
 * @param requestFunction - Function that performs the actual request
 * @param ttl - Time to live in milliseconds (default: 5000ms)
 * @returns Promise that resolves with the request result
 */
export function deduplicateRequest<T>(key: string, requestFunction: () => Promise<T>, ttl = 1000): Promise<T> {
	const existingRequest = pendingRequests.get(key);
	if (existingRequest) {
		if (dev) console.info(`Request deduplication: Using cached promise for key "${key}"`);
		return existingRequest as Promise<T>;
	}

	const promise = requestFunction().finally(() => {
		setTimeout(() => {
			if (pendingRequests.get(key) === promise) {
				pendingRequests.delete(key);
			}
		}, ttl);
	});

	pendingRequests.set(key, promise);
	return promise;
}

/**
 * Clears all pending requests from the cache.
 */
export function clearRequestCache(): void {
	pendingRequests.clear();
}
