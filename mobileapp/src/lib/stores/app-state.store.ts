import type { AppStateStore } from '$lib/models/stores';

import { get, writable } from 'svelte/store';

import { dev } from '$app/environment';

import { t } from '$lib/locales';
import { AlertType, AppStateType } from '$lib/models/ui';
import {
	authenticationStore,
	connectionStore,
	layoutStore,
	localeStore,
	notificationStore,
	organizationStore,
	themeStore,
	userStore
} from '$lib/stores';
import { clearRequestCache, showAlert } from '$lib/utility';

function createAppStateStore(): AppStateStore {
	const { set, subscribe } = writable<AppStateType>(AppStateType.UNINITIALIZED);
	const $t = get(t);

	let isInitialized = false;

	async function initialize(): Promise<void> {
		const currentState = get(appStateStore);

		if (currentState === AppStateType.UNINITIALIZED) {
			isInitialized = false;
		}

		if (isInitialized) return;
		isInitialized = true;

		try {
			set(AppStateType.INITIALIZING_CORE);
			await Promise.all([themeStore.init(), layoutStore.init(), localeStore.init()]);
			if (dev) console.info('Core stores initialized.');

			set(AppStateType.INITIALIZING_AUTH);
			await authenticationStore.init();
			if (dev) console.info('Authentication store initialized.');

			const isAuthenticated = !!get(authenticationStore);

			if (isAuthenticated) {
				set(AppStateType.INITIALIZING_BASE_DATA);
				await Promise.all([userStore.init(), organizationStore.init()]);
				void notificationStore.init();
				if (dev) console.info('Base data stores initialized.');
			} else {
				await Promise.all([userStore.reset(), organizationStore.reset()]);
			}
			connectionStore.init();
			set(AppStateType.READY);
		} catch (error) {
			set(AppStateType.ERROR);
			await showAlert($t('stores.app-state.error'), { type: AlertType.ERROR });
			if (dev) console.warn('AppStateStore initialization error:', error);
		}
	}

	async function reset(): Promise<void> {
		clearRequestCache();
		await Promise.all([userStore.reset(), organizationStore.reset(), authenticationStore.reset()]);
		set(AppStateType.READY);
		isInitialized = false;
	}

	async function initializeBaseData(): Promise<void> {
		try {
			set(AppStateType.INITIALIZING_BASE_DATA);
			await Promise.all([userStore.init(), organizationStore.init()]);
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
