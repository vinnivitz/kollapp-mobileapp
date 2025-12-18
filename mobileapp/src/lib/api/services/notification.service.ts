import { Device } from '@capacitor/device';

import { RequestMethod } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class NotificationService {
	ENDPOINT = '/notifications';

	/**
	 * Registers the device token for push notifications.
	 * @param token The device token.
	 * @returns {Promise<void>} A promise that resolves when the token is registered.
	 */
	async registerDeviceToken(token: string): Promise<void> {
		const info = await Device.getInfo();
		const deviceType = info.platform.toUpperCase();
		await customFetch(`${this.ENDPOINT}/register`, {
			body: { deviceType, token },
			method: RequestMethod.POST
		});
	}
}

export const notificationService = new NotificationService();
