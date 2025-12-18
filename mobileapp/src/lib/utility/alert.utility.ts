import { toastController } from '@ionic/core';
import { alertCircleOutline, checkmarkCircleSharp } from 'ionicons/icons';
import { get } from 'svelte/store';

import { dev } from '$app/environment';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { type AlertConfig, AlertType, AppStateType } from '$lib/models/ui';

type AlertQueueItem = {
	message: string;
	config?: AlertConfig;
};

let toast: HTMLIonToastElement | undefined;
const queuedAlerts: AlertQueueItem[] = [];
let isProcessingQueue = false;
let subscriptionInitialized = false;

/**
 * Initialize the subscription to app state (called lazily to avoid circular dependencies)
 */
function initializeSubscription(): void {
	if (subscriptionInitialized) return;
	subscriptionInitialized = true;

	// Lazy import to avoid circular dependency
	import('$lib/stores').then(({ appStateStore }) => {
		appStateStore.subscribe((state) => {
			if ((state === AppStateType.READY || state === AppStateType.ERROR) && !isProcessingQueue) {
				processQueuedAlerts();
			}
		});
	});
}

/**
 * Process any alerts that were queued during initialization
 */
async function processQueuedAlerts(): Promise<void> {
	if (isProcessingQueue || queuedAlerts.length === 0) return;

	isProcessingQueue = true;

	// Small delay to ensure Ionic components are fully rendered
	await new Promise((resolve) => setTimeout(resolve, 100));

	// Process queued alerts one at a time
	while (queuedAlerts.length > 0) {
		const queued = queuedAlerts.shift();
		if (queued) {
			await showAlertInternal(queued.message, queued.config);
			// Small delay between alerts to avoid overwhelming the user
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}

	isProcessingQueue = false;
}

/**
 * Shows an alert to the user
 * @param message alert message
 * @param config alert model
 */
export async function showAlert(message: string, config?: AlertConfig): Promise<void> {
	initializeSubscription();

	const { appStateStore } = await import('$lib/stores');
	const appState = get(appStateStore);

	console.log('appstat', appState);

	if (
		appState === AppStateType.UNINITIALIZED ||
		appState === AppStateType.INITIALIZING_CORE ||
		appState === AppStateType.INITIALIZING_AUTH ||
		appState === AppStateType.INITIALIZING_BASE_DATA
	) {
		queuedAlerts.push({ config, message });
		return;
	}

	await showAlertInternal(message, config);
}

/**
 * Shows an alert when a feature is not implemented
 * @returns {Promise<void>} A promise that resolves when the alert is shown
 */
export async function featureNotImplementedAlert(): Promise<void> {
	const $t = get(t);
	const message = $t('utility.alert.feature-not-implemented');
	await showAlert(message);
}

async function showAlertInternal(message: string, config?: AlertConfig): Promise<void> {
	try {
		const $t = get(t);
		const type = config?.type ?? AlertType.ERROR;

		const sanitizedMessage = sanitizeMessage(message);

		if (toast?.message === sanitizedMessage && toast.color === type) return;

		if (toast) {
			await toast.dismiss();
			toast = undefined;
		}

		toast = await toastController.create({
			buttons: [$t('utility.alert.toast.button')],
			color: type,
			duration: config?.duration ?? environment.toastDuration,
			icon: type === AlertType.ERROR ? alertCircleOutline : checkmarkCircleSharp,
			message: sanitizedMessage,
			swipeGesture: 'vertical'
		});

		toast.onDidDismiss().then(() => (toast = undefined));

		return toast.present();
	} catch (error) {
		if (dev) console.warn('Failed to show toast:', message, error);
	}
}

function sanitizeMessage(message: string): string {
	const div = document.createElement('div');
	div.textContent = message;
	return div.innerHTML;
}
