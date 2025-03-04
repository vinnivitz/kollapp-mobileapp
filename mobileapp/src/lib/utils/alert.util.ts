import { toastController } from 'ionic-svelte';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { AlertType, type AlertConfig } from '$lib/models/ui';

const $t = get(t);

/**
 * Shows an alert to the user
 * @param config alert model
 */
export async function showAlert(message: string, config?: AlertConfig): Promise<void> {
	const type = config?.type ?? AlertType.ERROR;
	const toast = await toastController.create({
		message,
		color: type,
		duration: config?.duration ?? 3000,
		icon: type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
		buttons: [$t('utils.alert.button')]
	});

	toast.present();
}
