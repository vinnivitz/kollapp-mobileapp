import { type ConnectionStatus, Network } from '@capacitor/network';
import { get, writable } from 'svelte/store';

import { t } from '$lib/locales';
import { PreferencesKey } from '$lib/models/preferences';
import { type ConnectionStore } from '$lib/models/stores';
import { AlertType } from '$lib/models/ui';
import { showAlert, storeValue } from '$lib/utility';

function createStore(): ConnectionStore {
	const { set, subscribe } = writable<boolean | undefined>();
	let isInitialized = false;

	async function init(): Promise<void> {
		if (isInitialized) return;
		isInitialized = true;

		const status = await Network.getStatus();
		await _set(status.connected);

		Network.addListener('networkStatusChange', async (status: ConnectionStatus) => {
			const $t = get(t);
			const wasOnline = get(connectionStore);
			const isOnline = status.connected;

			if (!isOnline && wasOnline) {
				await showAlert($t('api.offline'));
				console.info($t('api.offline'));
			} else if (isOnline && wasOnline === false) {
				await showAlert($t('api.online'), { type: AlertType.SUCCESS });
				console.info($t('api.online'));
			}

			await _set(isOnline);
		});
	}

	async function _set(value: boolean): Promise<void> {
		await storeValue(PreferencesKey.ONLINE, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(true);
	}

	async function check(): Promise<void> {
		const $t = get(t);
		const status = await Network.getStatus();
		const isOnline = status.connected;

		const wasOnline = get(connectionStore);

		if (!isOnline && wasOnline) {
			await showAlert($t('api.offline'));
			console.info($t('api.offline'));
		} else if (isOnline && wasOnline === false) {
			await showAlert($t('api.online'), { type: AlertType.SUCCESS });
			console.info($t('api.online'));
		}

		if (status.connected !== wasOnline) {
			await _set(isOnline);
		}
	}

	return {
		check,
		init,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Connection store for handling the current connection status and showing alerts if changing.
 */
export const connectionStore = createStore();
