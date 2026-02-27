import type { AppStateStore } from '$lib/models/stores';

import { get, writable } from 'svelte/store';

import { dev } from '$app/environment';

import { initializationStore } from './initialization.store';

import { t } from '$lib/locales';
import { AlertType, AppStateType } from '$lib/models/ui';
import {
	authenticationStore,
	connectionStore,
	layoutStore,
	localeStore,
	organizationStore,
	themeStore,
	userStore
} from '$lib/stores';
import { clearOfflineQueue, showAlert } from '$lib/utility';

function createAppStateStore(): AppStateStore {
	const { set, subscribe } = writable<AppStateType>(AppStateType.UNINITIALIZED);
	const $t = get(t);

	const unsubscribe = initializationStore.loaded.subscribe((value) => {
		if (value) {
			set(AppStateType.READY);
			unsubscribe();
		}
	});

	let isInitialized = false;

	async function initialize(): Promise<void> {
		if (isInitialized) return;
		isInitialized = true;

		try {
			set(AppStateType.INITIALIZING_CORE);
			await Promise.all([themeStore.initialize(), layoutStore.initialize(), localeStore.initialize()]);
			if (dev) console.info('Core stores initialized.');

			set(AppStateType.INITIALIZING_AUTH);
			await authenticationStore.initialize();
			if (dev) console.info('Authentication store initialized.');

			const isAuthenticated = !!get(authenticationStore);

			if (isAuthenticated) {
				set(AppStateType.INITIALIZING_BASE_DATA);
				void Promise.all([userStore.initialize(), organizationStore.initialize()]);
				if (dev) console.info('Base data stores initialized.');
			} else {
				void Promise.all([userStore.reset(), organizationStore.reset()]);
			}
			void connectionStore.initialize();
		} catch (error) {
			set(AppStateType.ERROR);
			await showAlert($t('stores.app-state.error'));
			if (dev) console.warn('AppStateStore initialization error:', error);
		}
	}

	async function reset(): Promise<void> {
		await Promise.all([userStore.reset(), organizationStore.reset(), authenticationStore.reset(), clearOfflineQueue()]);
		set(AppStateType.READY);
		isInitialized = false;
	}

	async function initializeBaseData(): Promise<void> {
		try {
			set(AppStateType.INITIALIZING_BASE_DATA);
			await Promise.all([userStore.initialize(), organizationStore.initialize()]);
			if (dev) console.info('Base data stores initialized.');
			set(AppStateType.READY);
		} catch (error) {
			set(AppStateType.ERROR);
			await showAlert($t('stores.app-state.error'), { type: AlertType.ERROR });
			if (dev) console.warn('AppStateStore base data initialization error:', error);
		}
	}

	return {
		initialize,
		initializeBaseData,
		reset,
		subscribe
	};
}

/**
 * App state store for managing application initialization and lifecycle.
 */
export const appStateStore = createAppStateStore();
