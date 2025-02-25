import { toastController } from 'ionic-svelte';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { AlertType, type AlertModel } from '$lib/models/ui';

const $t = get(t);

/**
 * Shows an alert to the user
 * @param model alert model
 */
export async function showAlert(model: AlertModel): Promise<void> {
	const toast = await toastController.create({
		color: model.type,
		duration: model.duration ?? 3000,
		message: model.message,
		icon: model.type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
		buttons: [$t('utils.alert.button')]
	});

	toast.present();
}
