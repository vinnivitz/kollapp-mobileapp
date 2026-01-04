/**
 * Device type enumeration for push notifications
 */
export enum DeviceType {
	ANDROID = 'ANDROID',
	IOS = 'IOS',
	WEB = 'WEB'
}

/**
 * Notification type enumeration for categorizing push notifications.
 */
export enum NotificationType {
	/** Events and activities notifications */
	ACTIVITIES = 'ACTIVITIES',
	/** Organization-wide announcements */
	ANNOUNCEMENTS = 'ANNOUNCEMENTS',
	/** Financial transactions and budget notifications */
	FINANCES = 'FINANCES',
	/** Legacy/fallback general notifications */
	GENERAL = 'GENERAL',
	/** Notifications about other members joining/requesting to join */
	MEMBERSHIP_CHANGES = 'MEMBERSHIP_CHANGES',
	/** Personal notifications about own membership status (approved, rejected, role changed) */
	MEMBERSHIP_STATUS = 'MEMBERSHIP_STATUS',
	/** Direct messages (future feature) */
	MESSAGES = 'MESSAGES',
	/** Critical system alerts */
	SYSTEM_ALERTS = 'SYSTEM_ALERTS'
}

/**
 * Device token registration request
 */
export type DeviceTokenRegistrationRequestTO = {
	deviceName: string;
	deviceType: DeviceType;
	token: string;
};

/**
 * Device token response
 */
export type DeviceTokenTO = {
	active: boolean;
	deviceType: DeviceType;
	id: number;
	token: string;
};

/**
 * Push notification response
 */
export type PushNotificationTO = {
	body: string;
	createdAt: string;
	id: number;
	notificationType: NotificationType;
	title: string;
	route?: string;
};

/**
 * Extracts the route from notification data.
 * @param data The data from Capacitor push notification (FCM sends as object with route property)
 * @returns The route string or undefined
 */
export function getNotificationRoute(data?: Record<string, string>): string | undefined {
	return data?.route;
}
