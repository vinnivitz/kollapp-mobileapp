import { toastController } from '@ionic/core';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import { dev } from '$app/environment';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { type AlertConfig, AlertType } from '$lib/models/ui';

let toast: HTMLIonToastElement | undefined;
let pendingToast: Promise<void> | undefined;

/**
 * Shows an alert when a feature is not implemented
 * @returns {Promise<void>} A promise that resolves when the alert is shown
 */
export async function featureNotImplementedAlert(): Promise<void> {
	const $t = get(t);
	const message = $t('utility.alert.feature-not-implemented');
	await showAlert(message);
}

export async function showAlert(message: string, config?: AlertConfig): Promise<void> {
	if (pendingToast) {
		await pendingToast;
	}

	try {
		const $t = get(t);
		const type = config?.type ?? AlertType.ERROR;

		if (toast?.message === message && toast.color === type) return;

		if (toast) {
			await toast.dismiss();
			toast = undefined;
		}

		pendingToast = (async () => {
			toast = await toastController.create({
				buttons: [$t('utility.alert.toast.button')],
				color: type,
				duration: config?.duration ?? environment.toastDuration,
				icon: type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
				message,
				swipeGesture: 'vertical'
			});

			toast.onDidDismiss().then(() => (toast = undefined));

			await toast.present();
		})();

		await pendingToast;
		pendingToast = undefined;
	} catch (error) {
		pendingToast = undefined;
		if (dev) console.warn('Failed to show toast:', message, error);
	}
}
