import { PushNotifications } from '@capacitor/push-notifications';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { initPushNotifications } from '$lib/utility';

function registerMocks(): void {
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
}

describe('push-notifications.utility', () => {
	beforeEach(async () => {
		registerMocks();
		vi.clearAllMocks();
	});

	describe('initPushNotifications', () => {
		it('should request permissions and register when granted', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'granted'
			});
			(PushNotifications.register as Mock).mockResolvedValue({});

			await initPushNotifications();

			expect(PushNotifications.requestPermissions).toHaveBeenCalled();
			expect(PushNotifications.register).toHaveBeenCalled();
			expect(PushNotifications.addListener).toHaveBeenCalledTimes(4);
		});

		it('should not register when permissions denied', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'denied'
			});

			await initPushNotifications();

			expect(PushNotifications.requestPermissions).toHaveBeenCalled();
			expect(PushNotifications.register).not.toHaveBeenCalled();
		});

		it('should add listener for registration', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(PushNotifications.addListener).toHaveBeenCalledWith('registration', expect.any(Function));
		});

		it('should add listener for registration error', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(PushNotifications.addListener).toHaveBeenCalledWith('registrationError', expect.any(Function));
		});

		it('should add listener for push notification received', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(PushNotifications.addListener).toHaveBeenCalledWith('pushNotificationReceived', expect.any(Function));
		});

		it('should add listener for push notification action performed', async () => {
			(PushNotifications.requestPermissions as Mock).mockResolvedValue({
				receive: 'granted'
			});

			await initPushNotifications();

			expect(PushNotifications.addListener).toHaveBeenCalledWith(
				'pushNotificationActionPerformed',
				expect.any(Function)
			);
		});

		it('should handle errors silently', async () => {
			(PushNotifications.requestPermissions as Mock).mockRejectedValue(new Error('Not supported'));

			await expect(initPushNotifications()).resolves.not.toThrow();
		});
	});
});
