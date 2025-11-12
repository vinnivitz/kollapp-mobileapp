import {
	type ActionPerformed,
	PushNotifications,
	type PushNotificationSchema,
	type RegistrationError,
	type Token
} from '@capacitor/push-notifications';

import { showAlert } from './alert.utility';

import { AlertType } from '$lib/models/ui';

export async function initPushNotifications(): Promise<void> {
	try {
		const result = await PushNotifications.requestPermissions();
		if (result.receive === 'granted') {
			await PushNotifications.register();
		}

		PushNotifications.addListener('registration', async (token: Token) => {
			await showAlert('Push registration success, token: ' + token.value, { type: AlertType.SUCCESS });
		});

		PushNotifications.addListener('registrationError', async (error: RegistrationError) => {
			await showAlert('Error on registration: ' + error.error);
		});

		PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
			await showAlert('Push received: ' + JSON.stringify(notification), { type: AlertType.SUCCESS });
		});

		PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
			await showAlert('Push action performed: ' + JSON.stringify(notification), { type: AlertType.SUCCESS });
		});
	} catch {
		console.info('Push notifications not supported on this platform');
	}
}
