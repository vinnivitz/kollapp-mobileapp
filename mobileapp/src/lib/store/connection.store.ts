import { Network, type ConnectionStatus } from '@capacitor/network';
import { get, writable } from 'svelte/store';

import environment from '$lib/environment';
import { t } from '$lib/locales';
import { PreferencesKey } from '$lib/models/preferences';
import { type ConnectionStore } from '$lib/models/store';
import { AlertType } from '$lib/models/ui';
import { showAlert, storeValue } from '$lib/utils';

const $t = get(t);

function createStore(): ConnectionStore {
	const { subscribe, set } = writable<boolean | undefined>();

	let lastNetworkCheck = 0;
	let cachedNetworkStatus: ConnectionStatus;

	async function init(): Promise<void> {
		const status = await getStatus();
		const isOnline = status?.connected ?? false;
		await storeValue(PreferencesKey.ONLINE, isOnline);
		set(isOnline);
	}
	async function _set(value: boolean): Promise<void> {
		await storeValue(PreferencesKey.ONLINE, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(true);
	}

	async function getStatus(): Promise<ConnectionStatus> {
		const now = Date.now();
		if (!cachedNetworkStatus || now - lastNetworkCheck > environment.networkCheckInterval) {
			cachedNetworkStatus = await Network.getStatus();
			lastNetworkCheck = now;
		}
		return cachedNetworkStatus;
	}

	async function check() {
		const networkStatus = await getStatus();
		const isOnline = networkStatus?.connected;
		const wasOnline = get(connectionStore);

		if (!isOnline && wasOnline) {
			await storeValue(PreferencesKey.ONLINE, false);
			showAlert($t('api.offline'));
			console.info($t('api.offline'));
		} else if (isOnline && !wasOnline) {
			await storeValue(PreferencesKey.ONLINE, true);
			showAlert($t('api.online'), { type: AlertType.INFO });
			console.info($t('api.online'));
		}
	}

	return {
		subscribe,
		set: _set,
		init,
		reset,
		check
	};
}

/**
 * Connection store for handling the current connection status and showing alerts if changing.
 */
export const connectionStore = createStore();
