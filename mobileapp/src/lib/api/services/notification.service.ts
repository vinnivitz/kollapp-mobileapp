import type { DeviceTokenRegistrationRequestTO, DeviceTokenTO, PushNotificationTO } from '$lib/api/dtos';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class NotificationService {
	ENDPOINT = 'notifications';

	/**
	 * Registers a device token for push notifications.
	 * @param request The device token registration request.
	 * @returns {Promise<ResponseBody<DeviceTokenTO>>} The response body.
	 */
	async registerDeviceToken(request: DeviceTokenRegistrationRequestTO): Promise<ResponseBody<DeviceTokenTO>> {
		return customFetch(`${this.ENDPOINT}/device-token`, {
			body: request,
			method: RequestMethod.POST,
			silentOnSuccess: true
		});
	}

	/**
	 * Unregisters a device token.
	 * @param token The device token to unregister.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async unregisterDeviceToken(token: string): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/device-token`, {
			method: RequestMethod.DELETE,
			query: { token },
			silentOnSuccess: true
		});
	}

	/**
	 * Gets all active device tokens for the logged in user.
	 * @returns {Promise<ResponseBody<DeviceTokenTO[]>>} The response body.
	 */
	async getUserDeviceTokens(): Promise<ResponseBody<DeviceTokenTO[]>> {
		return customFetch(`${this.ENDPOINT}/device-tokens`, {
			method: RequestMethod.GET
		});
	}

	/**
	 * Gets notifications for the logged in user.
	 * @param limit Optional limit for the number of notifications to retrieve.
	 * @returns {Promise<ResponseBody<PushNotificationTO[]>>} The response body.
	 */
	async getUserNotifications(limit?: number): Promise<ResponseBody<PushNotificationTO[]>> {
		const query = limit ? { limit: limit.toString() } : undefined;
		return customFetch(`${this.ENDPOINT}`, {
			method: RequestMethod.GET,
			query,
			silentOnSuccess: true
		});
	}

	/**
	 * Deletes a notification by its ID.
	 * @param id The ID of the notification to delete.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async deleteNotification(id: number): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/${id}`, {
			method: RequestMethod.DELETE
		});
	}

	/**
	 * Deletes all notifications for the logged in user.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async deleteAllNotifications(): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}`, {
			method: RequestMethod.DELETE
		});
	}
}

export const notificationService = new NotificationService();
