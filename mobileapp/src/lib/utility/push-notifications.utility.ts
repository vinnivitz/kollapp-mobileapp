import { Device, type DeviceInfo } from '@capacitor/device';
import {
	type ActionPerformed,
	type Channel,
	PushNotifications,
	type PushNotificationSchema,
	type RegistrationError,
	type Token
} from '@capacitor/push-notifications';
import { get } from 'svelte/store';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import { showAlert } from './alert.utility';
import { isAuthenticated } from './api.utility';
import { getStoredValue, storeValue } from './storage.utility';

import { DeviceType, NotificationType } from '$lib/api/dtos';
import { notificationService } from '$lib/api/services';
import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { AlertType } from '$lib/models/ui';

/**
 * Initializes push notifications for the application.
 * Requests permissions, registers the device, and sets up event listeners.
 * @returns {Promise<void>}
 */
export async function initPushNotifications(): Promise<void> {
	try {
		await registerNotificationChannels();

		let permissionStatus = await PushNotifications.checkPermissions();
		if (permissionStatus.receive === 'prompt') {
			permissionStatus = await PushNotifications.requestPermissions();
			if (permissionStatus.receive === 'granted') {
				await PushNotifications.register();
			}
		}

		await PushNotifications.removeAllListeners();

		PushNotifications.addListener('registration', async (token: Token) => {
			await handleTokenRegistration(token.value);
		});

		PushNotifications.addListener('registrationError', async (error: RegistrationError) => {
			console.error('Push notification registration error:', error);
		});

		PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
			await handleNotificationReceived(notification);
		});

		PushNotifications.addListener('pushNotificationActionPerformed', async (action: ActionPerformed) => {
			await handleNotificationAction(action);
		});

		const storedToken = await getStoredValue<string>(StorageKey.FCM_TOKEN);
		if (storedToken) {
			const authenticated = await isAuthenticated();
			if (authenticated) {
				await registerTokenWithBackend(storedToken);
			}
		}
	} catch {
		console.warn('Push notifications not supported on this platform');
	}
}

/**
 * Re-registers push notifications with the backend after user login.
 * Should be called after successful authentication.
 * @returns {Promise<void>}
 */
export async function reregisterPushNotifications(): Promise<void> {
	const storedToken = await getStoredValue<string>(StorageKey.FCM_TOKEN);
	if (storedToken) {
		await registerTokenWithBackend(storedToken);
	}
}

/**
 * Unregisters the device token from the backend.
 * Should be called when user logs out.
 * @returns {Promise<void>}
 */
export async function unregisterPushNotifications(): Promise<void> {
	try {
		const storedToken = await getStoredValue<string>(StorageKey.FCM_TOKEN);
		if (storedToken) {
			await notificationService.unregisterDeviceToken(storedToken);
			if (dev) console.info('Device token unregistered successfully');
		}
	} catch (error) {
		console.warn('Failed to unregister device token:', error);
	}
}

/**
 * Handles token registration by sending it to the backend.
 * @param token The FCM device token.
 * @returns {Promise<void>}
 */
async function handleTokenRegistration(token: string): Promise<void> {
	await storeValue(StorageKey.FCM_TOKEN, token);

	const authenticated = await isAuthenticated();

	if (!authenticated) return;
	await registerTokenWithBackend(token);
}

/**
 * Registers the device token with the backend.
 * @param token The FCM device token.
 * @returns {Promise<void>}
 */
async function registerTokenWithBackend(token: string): Promise<void> {
	const $t = get(t);
	try {
		const deviceInfo = await Device.getInfo();
		const deviceType = getDeviceType(deviceInfo.platform);

		await notificationService.registerDeviceToken({
			deviceType,
			token
		});
	} catch {
		await showAlert($t('utility.push-notifications.error'));
	}
}

/**
 * Handles received push notifications while app is in foreground.
 * @param notification The received notification.
 * @returns {Promise<void>}
 */
async function handleNotificationReceived(notification: PushNotificationSchema): Promise<void> {
	await showAlert(notification.title ?? '', { type: AlertType.SUCCESS });
}

/**
 * Handles notification action performed (when user taps on notification).
 * @param action The notification action performed.
 */
async function handleNotificationAction(action: ActionPerformed): Promise<void> {
	const data = action.notification.data;
	await (data && data.route
		? goto(resolve(data.route))
		: showAlert(action.notification.title ?? '', { type: AlertType.SUCCESS }));
}

/**
 * Registers notification channels/categories with the OS.
 * For iOS: Creates UNNotificationCategory for each NotificationType.
 * For Android: Creates NotificationChannel for each NotificationType.
 * This allows users to configure notification preferences per channel in System Settings.
 * @returns {Promise<void>}
 */
async function registerNotificationChannels(): Promise<void> {
	try {
		const deviceInfo = await Device.getInfo();
		const channels: Channel[] = [
			{
				description: 'General notifications',
				id: NotificationType.GENERAL,
				importance: 3,
				name: 'General',
				visibility: 1
			},
			{
				description: 'Personal notifications about your membership status',
				id: NotificationType.MEMBERSHIP_STATUS,
				importance: 4,
				name: 'Membership Status'
			},
			{
				description: 'Notifications about other members joining or requesting to join',
				id: NotificationType.MEMBERSHIP_CHANGES,
				importance: 3,
				name: 'Membership Changes'
			},
			{
				description: 'Events and activities notifications',
				id: NotificationType.ACTIVITIES,
				importance: 4,
				name: 'Activities'
			},
			{
				description: 'Financial transactions and budget notifications',
				id: NotificationType.FINANCES,
				importance: 4,
				name: 'Finances'
			},
			{
				description: 'Organization-wide announcements',
				id: NotificationType.ANNOUNCEMENTS,
				importance: 4,
				name: 'Announcements'
			},
			{
				description: 'Direct messages',
				id: NotificationType.MESSAGES,
				importance: 4,
				name: 'Messages'
			},
			{
				description: 'Critical system alerts',
				id: NotificationType.SYSTEM_ALERTS,
				importance: 5,
				name: 'System Alerts'
			}
		];

		if (deviceInfo.platform === 'android') {
			for (const channel of channels) {
				await PushNotifications.createChannel({
					description: channel.description,
					id: channel.id,
					importance: channel.importance,
					name: channel.name,
					sound: 'default',
					vibration: true,
					visibility: 1
				});
			}
			if (dev) console.info('Android notification channels registered');
		}
		if (dev && deviceInfo.platform === 'ios') {
			console.info('iOS will use notification categories from FCM messages');
		}
	} catch (error) {
		console.warn('Failed to register notification channels:', error);
	}
}

/**
 * Determines the device type based on the platform.
 * @param platform The platform string from Capacitor Device.
 * @returns {DeviceType} The corresponding DeviceType enum value.
 */
function getDeviceType(platform: DeviceInfo['platform']): DeviceType {
	switch (platform) {
		case 'android': {
			return DeviceType.ANDROID;
		}
		case 'ios': {
			return DeviceType.IOS;
		}
		default: {
			return DeviceType.WEB;
		}
	}
}
