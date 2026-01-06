import type { PushNotificationTO } from '$lib/api/dtos';
import type { LoadableStore } from '$lib/models/stores';
import type { Readable } from 'svelte/store';

export type NotificationStore = LoadableStore<PushNotificationTO[]> & {
	/**
	 * Store containing the set of read notification IDs.
	 */
	readNotifications: Readable<Set<number>>;

	/**
	 * Clears all read notification statuses.
	 * @returns {Promise<void>}
	 */
	clearReadStatuses(): Promise<void>;

	/**
	 * Fetches notifications from the backend.
	 * @param limit Optional limit for the number of notifications to retrieve.
	 * @returns {Promise<void>}
	 */
	fetch(limit?: number): Promise<void>;

	/**
	 * Marks a notification as read.
	 * @param notificationId The ID of the notification to mark as read.
	 * @returns {Promise<void>}
	 */
	markAsRead(notificationId: number): Promise<void>;

	/**
	 * Marks multiple notifications as read.
	 * @param notificationIds Array of notification IDs to mark as read.
	 * @returns {Promise<void>}
	 */
	markMultipleAsRead(notificationIds: number[]): Promise<void>;

	/**
	 * Removes read status from a notification.
	 * @param notificationId The ID of the notification to unmark.
	 * @returns {Promise<void>}
	 */
	removeReadStatus(notificationId: number): Promise<void>;
};
