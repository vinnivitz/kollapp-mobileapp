import { toastController } from '@ionic/core';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { type AlertConfig, AlertType } from '$lib/models/ui';

let toast: HTMLIonToastElement | undefined;

/**
 * Shows an alert to the user
 * @param message alert message
 * @param config alert model
 */
export async function showAlert(message: string, config?: AlertConfig): Promise<void> {
	const $t = get(t);
	const type = config?.type ?? AlertType.ERROR;

	const sanitizedMessage = sanitizeMessage(message);

	if (toast?.message === sanitizedMessage && toast.color === type) return;

	if (toast) {
		await toast.dismiss();
		toast = undefined;
	}

	toast = await toastController.create({
		buttons: [$t('utils.alert.button')],
		color: type,
		duration: config?.duration ?? environment.toastDuration,
		icon: type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
		message: sanitizedMessage,
		swipeGesture: 'vertical'
	});

	toast.onDidDismiss().then(() => (toast = undefined));

	return toast.present();
}

/**
 * Shows an alert when a feature is not implemented
 * @returns {Promise<void>} A promise that resolves when the alert is shown
 */
export async function featureNotImplementedAlert(): Promise<void> {
	const $t = get(t);
	const message = $t('utils.alert.feature-not-implemented');
	await showAlert(message);
}

function sanitizeMessage(message: string): string {
	const div = document.createElement('div');
	div.textContent = message;
	return div.innerHTML;
}
