/**
 * Device type enumeration for push notifications
 */
export enum DeviceType {
	ANDROID = 'ANDROID',
	IOS = 'IOS',
	WEB = 'WEB'
}

/**
 * Device token registration request
 */
export type DeviceTokenRegistrationRequestTO = {
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
 * Send notification request
 */
export type SendNotificationRequestTO = {
	body: string;
	title: string;
	data?: Record<string, string>;
};
