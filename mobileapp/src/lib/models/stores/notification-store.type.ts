import type { PushNotificationTO } from '$lib/api/dtos';
import type { LoadableStore } from '$lib/models/stores';

export type NotificationStore = LoadableStore<PushNotificationTO[]> & {
	/**
	 * Fetches notifications from the backend.
	 * @param limit Optional limit for the number of notifications to retrieve.
	 * @returns {Promise<void>}
	 */
	fetch(limit?: number): Promise<void>;
};
