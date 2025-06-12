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

	return toast.present();
}
