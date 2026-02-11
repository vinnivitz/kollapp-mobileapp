import { get } from 'svelte/store';

import { dev } from '$app/environment';

import { t } from '$lib/locales';
import { type CustomFetchConfig, type OfflineRequest, RequestMethod, type ResponseBody } from '$lib/models/api';
import { StorageKey } from '$lib/models/storage';
import { AlertType } from '$lib/models/ui';
import { getStoredValue, refreshDataStores, showAlert, storeValue } from '$lib/utility';

let isProcessing = false;
const MAX_RETRIES = 3;

/**
 * Generates a unique ID for offline requests
 */
function generateId(): string {
	// eslint-disable-next-line sonarjs/pseudo-random
	return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Gets all queued offline requests
 */
async function getOfflineQueue(): Promise<OfflineRequest[]> {
	return (await getStoredValue<OfflineRequest[]>(StorageKey.OFFLINE_QUEUE)) ?? [];
}

/**
 * Removes a specific request from the queue
 */
async function removeFromOfflineQueue(id: string): Promise<void> {
	const queue = await getOfflineQueue();
	const filtered = queue.filter((r) => r.id !== id);
	await storeValue(StorageKey.OFFLINE_QUEUE, filtered);
}

/**
 * Adds a request to the offline queue
 * @param url The endpoint URL
 * @param method The HTTP method
 * @param body Optional request body
 * @param query Optional query parameters
 */
export async function queueOfflineRequest(
	url: string,
	method: RequestMethod,
	body?: object,
	query?: Record<string, string>
): Promise<void> {
	const $t = get(t);
	const queue = await getOfflineQueue();

	const request: OfflineRequest = {
		body,
		id: generateId(),
		method,
		query,
		queuedAt: Date.now(),
		retryCount: 0,
		url
	};

	queue.push(request);
	await storeValue(StorageKey.OFFLINE_QUEUE, queue);

	await showAlert($t('utility.offline-queue.request-queued'), { type: AlertType.SUCCESS });

	if (dev) {
		console.info('Request queued for offline sync:', request);
	}
}

/**
 * Clears the entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
	await storeValue(StorageKey.OFFLINE_QUEUE, []);
}

/**
 * Processes all queued offline requests
 * Sends each request using customFetch and shows alerts with server messages
 */
export async function processOfflineQueue(): Promise<void> {
	if (isProcessing) return;

	const queue = await getOfflineQueue();
	if (queue.length === 0) return;

	isProcessing = true;

	if (dev) {
		console.info(`Processing ${queue.length} queued offline request(s)...`);
	}

	// Dynamic import to avoid circular dependency
	const { customFetch, StatusCheck } = await import('$lib/utility');

	for (const request of queue) {
		await processRequest(request, customFetch, StatusCheck);
	}

	isProcessing = false;

	if (dev) {
		console.info('Offline queue processing complete.');
	}
}

async function processRequest(
	request: OfflineRequest,
	customFetch: <T = never>(url: string, config?: CustomFetchConfig | undefined) => Promise<ResponseBody<T>>,
	StatusCheck: {
		isForbidden: (status: number) => boolean;
		isOK: (status: number) => boolean;
		isUnauthorized: (status: number) => boolean;
		serverNotReachable: (status: number) => boolean;
	}
): Promise<void> {
	try {
		const config = {
			body: request.body,
			method: request.method,
			offlineQueueable: false,
			query: request.query,
			silentOnSuccess: false
		} as CustomFetchConfig;

		const response = await customFetch(request.url, config);

		await (StatusCheck.isOK(response.status)
			? handleSuccess(request, response.message)
			: handleFailure(request, response.message));
	} catch (error) {
		if (dev) {
			console.warn(`Error processing queued request: ${request.url}`, error);
		}
	}
}

async function handleSuccess(request: OfflineRequest, message: string): Promise<void> {
	await Promise.all([
		removeFromOfflineQueue(request.id),
		refreshDataStores(),
		showAlert(message, { type: AlertType.SUCCESS })
	]);
	if (dev) {
		console.info(`Queued request synced successfully: ${request.url}`, message);
	}
}

async function handleFailure(request: OfflineRequest, message: string): Promise<void> {
	const retryCount = (request.retryCount ?? 0) + 1;

	if (retryCount >= MAX_RETRIES) {
		await removeFromOfflineQueue(request.id);
		await showAlert(message);

		if (dev) {
			console.warn(`Removed queued request after ${MAX_RETRIES} failed attempts: ${request.url}`, message);
		}
	} else {
		const queue = await getOfflineQueue();
		const updated = queue.map((r) => (r.id === request.id ? { ...r, retryCount } : r));
		await storeValue(StorageKey.OFFLINE_QUEUE, updated);

		if (dev) {
			console.warn(`Failed to sync queued request (attempt ${retryCount}/${MAX_RETRIES}): ${request.url}`, message);
		}
	}
}
