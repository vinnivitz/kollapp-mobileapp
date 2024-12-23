import { toastController } from 'ionic-svelte';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { AlertType, type AlertModel } from '$lib/models';

const $t = get(t);

export async function showAlert(model: AlertModel) {
	const toast = await toastController.create({
		color: model.type,
		duration: model.duration ?? 3000,
		message: model.message,
		icon: model.type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
		buttons: [$t('utils.alert.button')]
	});

	toast.present();
}
