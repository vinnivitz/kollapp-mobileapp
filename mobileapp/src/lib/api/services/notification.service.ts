import type { DeviceTokenRegistrationRequestTO, DeviceTokenTO, SendNotificationRequestTO } from '$lib/api/dtos';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class NotificationResource {
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
	 * Sends a test push notification to the logged in user.
	 * @param request The notification request.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async sendTestNotification(request: SendNotificationRequestTO): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/send`, {
			body: request,
			method: RequestMethod.POST
		});
	}
}

export const notificationService = new NotificationResource();
