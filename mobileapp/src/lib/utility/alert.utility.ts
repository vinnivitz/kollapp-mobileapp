import { toastController } from 'ionic-svelte';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { type AlertConfig, AlertType } from '$lib/models/ui';

const $t = get(t);

let toast: HTMLIonToastElement | undefined;

/**
 * Shows an alert to the user
 * @param message alert message
 * @param config alert model
 */
export async function showAlert(message: string, config?: AlertConfig): Promise<void> {
	const type = config?.type ?? AlertType.ERROR;

	if (toast?.message === message && toast.color === type) return;

	if (toast) {
		await toast.dismiss();
		toast = undefined;
	}

	toast = await toastController.create({
		buttons: [$t('utils.alert.button')],
		color: type,
		duration: config?.duration ?? environment.toastDuration,
		icon: type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
		message,
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
	const message = $t('utils.alert.feature-not-implemented');
	await showAlert(message);
}
