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

		PushNotifications.addListener('registration', (token: Token) => {
			showAlert('Push registration success, token: ' + token.value, { type: AlertType.SUCCESS });
		});

		PushNotifications.addListener('registrationError', (error: RegistrationError) => {
			showAlert('Error on registration: ' + error.error);
		});

		PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
			showAlert('Push received: ' + JSON.stringify(notification), { type: AlertType.SUCCESS });
		});

		PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
			showAlert('Push action performed: ' + JSON.stringify(notification), { type: AlertType.SUCCESS });
		});
	} catch {
		console.info('Push notifications not supported on this platform');
	}
}
