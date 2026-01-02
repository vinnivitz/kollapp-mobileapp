import type { PushNotificationTO } from '$lib/api/dtos';
import type { NotificationStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { notificationService } from '$lib/api/services';
import { StorageKey } from '$lib/models/storage';
import { deduplicateRequest, getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

const NOTIFICATION_STORE_INIT_REQUEST_KEY = 'notification-store-init';
const NOTIFICATION_STORE_FETCH_REQUEST_KEY = 'notification-store-fetch';

function createStore(): NotificationStore {
	const { set, subscribe } = writable<PushNotificationTO[]>([]);
	const loadedCache = writable(false);
	const loadedServer = writable(false);

	async function fetch(limit?: number): Promise<void> {
		return deduplicateRequest(NOTIFICATION_STORE_FETCH_REQUEST_KEY, async () => {
			const response = await notificationService.getUserNotifications(limit);

			if (StatusCheck.isOK(response.status)) {
				await _set(response.data || []);
			}
		});
	}

	async function init(): Promise<void> {
		return deduplicateRequest(NOTIFICATION_STORE_INIT_REQUEST_KEY, async () => {
			const storedNotifications = await getStoredValue<PushNotificationTO[]>(StorageKey.NOTIFICATIONS);
			if (storedNotifications) {
				set(storedNotifications);
				loadedCache.set(true);
			}

			const response = await notificationService.getUserNotifications();

			if (StatusCheck.isOK(response.status)) {
				await _set(response.data || []);
			} else if (StatusCheck.isUnauthorized(response.status)) {
				await _set([]);
			}

			loadedServer.set(true);
		});
	}

	async function _set(notifications: PushNotificationTO[]): Promise<void> {
		await (notifications.length > 0
			? storeValue(StorageKey.NOTIFICATIONS, notifications)
			: removeStoredValue(StorageKey.NOTIFICATIONS));
		set(notifications);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set([]);
	}

	return {
		fetch,
		init,
		loadedCache,
		loadedServer,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Notification store for handling user notifications.
 */
export const notificationStore = createStore();
