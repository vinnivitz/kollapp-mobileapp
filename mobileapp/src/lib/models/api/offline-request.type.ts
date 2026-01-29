import type { RequestMethod } from './request-method.enum';

/**
 * Represents a request that was queued while offline
 */
export type OfflineRequest = {
	/** Unique identifier for the request */
	id: string;
	/** HTTP method */
	method: RequestMethod;
	/** Timestamp when the request was queued */
	queuedAt: number;
	/** The URL endpoint (without base URL) */
	url: string;
	/** Request body (for POST, PUT, PATCH, DELETE) */
	body?: object;
	/** Optional description for the user */
	description?: string;
	/** Query parameters */
	query?: Record<string, string>;
};
