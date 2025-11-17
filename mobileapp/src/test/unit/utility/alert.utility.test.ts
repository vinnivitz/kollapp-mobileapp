/* eslint-disable @typescript-eslint/no-explicit-any, unicorn/consistent-function-scoping */

import type { ToastOptions } from '@ionic/core';

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { AlertType } from '$lib/models/ui';
import { featureNotImplementedAlert, showAlert } from '$lib/utility';

type MockToast = {
	color: string | undefined;
	message: string | undefined;
	dismiss: () => Promise<boolean>;
	onDidDismiss: () => Promise<{ role: string }>;
	present: () => Promise<void>;
};

type MockToastController = {
	create(options: ToastOptions): Promise<HTMLIonToastElement>;
	dismiss(data?: any, role?: string, id?: string): Promise<boolean>;
	getTop(): Promise<HTMLIonToastElement | undefined>;
};

function registerMocks(): void {
	vi.mock('svelte/store', async (importOriginal) => {
		const actual = await importOriginal<typeof import('svelte/store')>();
		return {
			...actual,
			get: vi.fn(() => (key: string) => key)
		};
	});

	vi.mock('@ionic/core', () => ({
		toastController: {
			create: vi.fn()
		}
	}));

	vi.mock('$lib/environment', () => ({
		default: {
			preferencesPrefix: 'test',
			toastDuration: 3000
		}
	}));

	vi.mock('$lib/locales', () => {
		const mockStore = {
			subscribe: vi.fn((callback: any) => {
				callback((key: string) => key);
				return vi.fn();
			})
		};
		return { t: mockStore };
	});

	vi.mock('$lib/stores', () => ({
		appStateStore: {
			subscribe: vi.fn((callback: any) => {
				callback(3); // AppStateType.READY
				return vi.fn();
			})
		}
	}));
}

describe('alert.utility', () => {
	let mockToast: MockToast;
	let mockToastController: MockToastController;

	beforeEach(async () => {
		registerMocks();
		vi.clearAllMocks();

		mockToast = {
			color: undefined,
			dismiss: vi.fn().mockResolvedValue(true),
			message: undefined,
			onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }),
			present: vi.fn().mockResolvedValue({})
		};

		const { toastController } = await import('@ionic/core');
		mockToastController = toastController;
		(mockToastController.create as Mock).mockResolvedValue(mockToast);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('showAlert', () => {
		it('should create and present a toast with default config', async () => {
			await showAlert('Test message');
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(mockToastController.create).toHaveBeenCalledWith(
				expect.objectContaining({
					color: AlertType.ERROR,
					message: 'Test message'
				})
			);
			expect(mockToast.present).toHaveBeenCalled();
		});

		it('should create toast with custom duration', async () => {
			await showAlert('Test message', { duration: 5000 });

			expect(mockToastController.create).toHaveBeenCalledWith(
				expect.objectContaining({
					duration: 5000,
					message: 'Test message'
				})
			);
		});

		it('should create toast with success type', async () => {
			await showAlert('Success message', { type: AlertType.SUCCESS });

			expect(mockToastController.create).toHaveBeenCalledWith(
				expect.objectContaining({
					color: 'success',
					message: 'Success message'
				})
			);
		});
	});

	describe('featureNotImplementedAlert', () => {
		it('should show feature not implemented alert', async () => {
			await featureNotImplementedAlert();

			expect(mockToastController.create).toHaveBeenCalled();
			expect(mockToast.present).toHaveBeenCalled();
		});
	});
});
