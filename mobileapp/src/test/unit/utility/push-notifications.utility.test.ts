/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { initPushNotifications } from '$lib/utility';

vi.mock('@capacitor/push-notifications', () => ({
	PushNotifications: {
		addListener: vi.fn(),
		register: vi.fn(),
		requestPermissions: vi.fn()
	}
}));

vi.mock('$lib/utility/alert.utility', () => ({
	showAlert: vi.fn()
}));

describe('push-notifications.utility', () => {
	let mockPushNotifications: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		const { PushNotifications } = await import('@capacitor/push-notifications');
		mockPushNotifications = PushNotifications;
	});

	describe('initPushNotifications', () => {
		it('should request permissions and register when granted', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'granted'
			});
			mockPushNotifications.register.mockResolvedValue();

			await initPushNotifications();

			expect(mockPushNotifications.requestPermissions).toHaveBeenCalled();
			expect(mockPushNotifications.register).toHaveBeenCalled();
			expect(mockPushNotifications.addListener).toHaveBeenCalledTimes(4);
		});

		it('should not register when permissions denied', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'denied'
			});

			await initPushNotifications();

			expect(mockPushNotifications.requestPermissions).toHaveBeenCalled();
			expect(mockPushNotifications.register).not.toHaveBeenCalled();
		});

		it('should add listener for registration', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(mockPushNotifications.addListener).toHaveBeenCalledWith('registration', expect.any(Function));
		});

		it('should add listener for registration error', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(mockPushNotifications.addListener).toHaveBeenCalledWith('registrationError', expect.any(Function));
		});

		it('should add listener for push notification received', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(mockPushNotifications.addListener).toHaveBeenCalledWith('pushNotificationReceived', expect.any(Function));
		});

		it('should add listener for push notification action performed', async () => {
			mockPushNotifications.requestPermissions.mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
				'pushNotificationActionPerformed',
				expect.any(Function)
			);
		});

		it('should handle errors silently', async () => {
			mockPushNotifications.requestPermissions.mockRejectedValue(new Error('Not supported'));

			await expect(initPushNotifications()).resolves.not.toThrow();
		});
	});
});
