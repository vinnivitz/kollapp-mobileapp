import { Device, type DeviceInfo } from '@capacitor/device';
import { type ActionPerformed, type Channel, PushNotifications, type Token } from '@capacitor/push-notifications';
import { get } from 'svelte/store';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';

import { isAuthenticated, StatusCheck } from './api.utility';
import { getStoredValue, storeValue } from './storage.utility';

import { DeviceType, getNotificationRoute, NotificationType } from '$lib/api/dtos';
import { notificationService } from '$lib/api/services';
import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { notificationStore } from '$lib/stores';
import { showAlert } from '$lib/utility';

/**
 * Initializes push notifications for the application.
 * Requests permissions, registers the device, and sets up event listeners.
 * @returns {Promise<void>}
 */
export async function initPushNotifications(): Promise<void> {
	const $t = get(t);
	try {
		await PushNotifications.removeAllListeners();

		await registerNotificationChannels();

		let permissionStatus = await PushNotifications.checkPermissions();
		if (permissionStatus.receive === 'prompt') {
			permissionStatus = await PushNotifications.requestPermissions();
		}

		if (permissionStatus.receive !== 'granted') {
			if (dev) console.warn('Push notification permission not granted');
			return;
		}

		PushNotifications.addListener('registration', async (token: Token) => {
			await handleTokenRegistration(token.value);
		});

		PushNotifications.addListener('registrationError', async () => {
			await showAlert($t('utility.push-notifications.error'));
		});

		PushNotifications.addListener('pushNotificationReceived', async () => {
			await handleNotificationReceived();
		});

		PushNotifications.addListener('pushNotificationActionPerformed', async (action: ActionPerformed) => {
			await handleNotificationAction(action);
		});

		await PushNotifications.register();

		const storedToken = await getStoredValue<string>(StorageKey.FCM_TOKEN);
		if (storedToken) {
			const authenticated = await isAuthenticated();
			if (authenticated) {
				await registerTokenWithBackend(storedToken);
			}
		}
	} catch {
		if (dev) console.warn('Push notifications not supported on this platform');
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
		}
	} catch (error) {
		if (dev) console.warn('Failed to unregister device token:', error);
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
		const deviceName =
			deviceInfo.name || `${deviceInfo.manufacturer} ${deviceInfo.model || deviceInfo.platform}`.trim();

		const result = await notificationService.registerDeviceToken({
			deviceName,
			deviceType,
			token
		});
		if (!StatusCheck.isOK(result.status)) {
			showAlert($t('utility.push-notifications.error'));
		}
	} catch {
		await showAlert($t('utility.push-notifications.error'));
	}
}

/**
 * Handles received push notifications while app is in foreground.
 * @returns {Promise<void>}
 */
async function handleNotificationReceived(): Promise<void> {
	await notificationStore.fetch();
}

/**
 * Handles notification action performed (when user taps on notification).
 * @param action The notification action performed.
 */
async function handleNotificationAction(action: ActionPerformed): Promise<void> {
	const route = getNotificationRoute(action.notification.data);
	if (route) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(route);
	}
	await notificationStore.fetch();
}

/**
 * Registers notification channels/categories with the OS.
 * For iOS: Creates UNNotificationCategory for each NotificationType.
 * For Android: Creates NotificationChannel for each NotificationType.
 * This allows users to configure notification preferences per channel in System Settings.
 * @returns {Promise<void>}
 */
async function registerNotificationChannels(): Promise<void> {
	const $t = get(t);
	try {
		const deviceInfo = await Device.getInfo();

		const channels: Channel[] = [
			{
				description: $t('utility.push-notifications.channels.general.description'),
				id: NotificationType.GENERAL,
				name: $t('utility.push-notifications.channels.general.name')
			},
			{
				description: $t('utility.push-notifications.channels.membership-status.description'),
				id: NotificationType.MEMBERSHIP_STATUS,
				name: $t('utility.push-notifications.channels.membership-status.name')
			},
			{
				description: $t('utility.push-notifications.channels.membership-changes.description'),
				id: NotificationType.MEMBERSHIP_CHANGES,
				name: $t('utility.push-notifications.channels.membership-changes.name')
			},
			{
				description: $t('utility.push-notifications.channels.activities.description'),
				id: NotificationType.ACTIVITIES,
				name: $t('utility.push-notifications.channels.activities.name')
			},
			{
				description: $t('utility.push-notifications.channels.finances.description'),
				id: NotificationType.FINANCES,
				name: $t('utility.push-notifications.channels.finances.name')
			},
			{
				description: $t('utility.push-notifications.channels.announcements.description'),
				id: NotificationType.ANNOUNCEMENTS,
				name: $t('utility.push-notifications.channels.announcements.name')
			},
			{
				description: $t('utility.push-notifications.channels.messages.description'),
				id: NotificationType.MESSAGES,
				name: $t('utility.push-notifications.channels.messages.name')
			},
			{
				description: $t('utility.push-notifications.channels.system-alerts.description'),
				id: NotificationType.SYSTEM_ALERTS,
				name: $t('utility.push-notifications.channels.system-alerts.name')
			}
		];

		if (deviceInfo.platform === 'android') {
			await Promise.all(
				channels.map(({ description, id, name }) =>
					PushNotifications.createChannel({
						description,
						id,
						importance: 4,
						name,
						sound: 'default',
						vibration: true,
						visibility: 1
					})
				)
			);
			if (dev) console.info('Android notification channels registered');
		}
		if (dev && deviceInfo.platform === 'ios') {
			console.info('iOS will use notification categories from FCM messages');
		}
	} catch (error) {
		if (dev) console.warn('Failed to register notification channels:', error);
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
