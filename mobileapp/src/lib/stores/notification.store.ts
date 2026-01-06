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
	const readNotifications = writable<Set<number>>(new Set());

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

			const storedReadIds = (await getStoredValue<number[]>(StorageKey.NOTIFICATIONS_READ)) ?? [];
			readNotifications.set(new Set(storedReadIds));

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
		readNotifications.set(new Set());
		await removeStoredValue(StorageKey.NOTIFICATIONS_READ);
	}

	async function markAsRead(notificationId: number): Promise<void> {
		readNotifications.update((ids) => {
			ids.add(notificationId);
			void storeValue(StorageKey.NOTIFICATIONS_READ, [...ids]);
			return ids;
		});
	}

	async function markMultipleAsRead(notificationIds: number[]): Promise<void> {
		readNotifications.update((ids) => {
			for (const id of notificationIds) {
				ids.add(id);
			}
			void storeValue(StorageKey.NOTIFICATIONS_READ, [...ids]);
			return ids;
		});
	}

	async function removeReadStatus(notificationId: number): Promise<void> {
		readNotifications.update((ids) => {
			ids.delete(notificationId);
			void storeValue(StorageKey.NOTIFICATIONS_READ, [...ids]);
			return ids;
		});
	}

	async function clearReadStatuses(): Promise<void> {
		readNotifications.set(new Set());
		await storeValue(StorageKey.NOTIFICATIONS_READ, []);
	}

	return {
		clearReadStatuses,
		fetch,
		init,
		loadedCache,
		loadedServer,
		markAsRead,
		markMultipleAsRead,
		readNotifications,
		removeReadStatus,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Notification store for handling user notifications.
 */
export const notificationStore = createStore();
