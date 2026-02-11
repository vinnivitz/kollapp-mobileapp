import { type ConnectionStatus, Network } from '@capacitor/network';
import { get, writable } from 'svelte/store';

import { dev } from '$app/environment';

import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { type ConnectionStore } from '$lib/models/stores';
import { AlertType } from '$lib/models/ui';
import { processOfflineQueue, showAlert, storeValue } from '$lib/utility';

async function handleConnectionChange(isOnline: boolean, wasOnline?: boolean): Promise<void> {
	const $t = get(t);

	if (!isOnline && wasOnline) {
		await showAlert($t('stores.connection.offline'));
		if (dev) console.info('User is offline.');
	} else if (isOnline && wasOnline === false) {
		await showAlert($t('stores.connection.online'), { type: AlertType.SUCCESS });
		if (dev) console.info('User is online.');
		void processOfflineQueue();
	}
}

function createStore(): ConnectionStore {
	const { set, subscribe } = writable<boolean | undefined>();
	let isInitialized = false;
	let listenerHandle: Awaited<ReturnType<typeof Network.addListener>> | undefined;

	async function initialize(): Promise<void> {
		if (isInitialized) return;
		isInitialized = true;

		const status = await Network.getStatus();
		await _set(status.connected);

		listenerHandle = await Network.addListener('networkStatusChange', async (status: ConnectionStatus) => {
			const wasOnline = get(connectionStore);
			const isOnline = status.connected;

			await handleConnectionChange(isOnline, wasOnline);
			await _set(isOnline);
		});
	}

	async function _set(value: boolean): Promise<void> {
		await storeValue(StorageKey.ONLINE, value);
		set(value);
	}

	async function reset(): Promise<void> {
		await _set(true);
	}

	async function check(): Promise<void> {
		const status = await Network.getStatus();
		const isOnline = status.connected;
		const wasOnline = get(connectionStore);

		await handleConnectionChange(isOnline, wasOnline);

		if (status.connected !== wasOnline) {
			await _set(isOnline);
		}
	}

	async function destroy(): Promise<void> {
		await listenerHandle?.remove();
		listenerHandle = undefined;
		isInitialized = false;
	}

	return {
		check,
		destroy,
		initialize,
		reset,
		set: _set,
		subscribe
	};
}

/**
 * Connection store for handling the current connection status and showing alerts if changing.
 */
export const connectionStore = createStore();
