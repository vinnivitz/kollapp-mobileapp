import type { AppStateStore } from '$lib/models/stores';

import { get, writable } from 'svelte/store';

import { dev } from '$app/environment';

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
import { showAlert } from '$lib/utility';

function createAppStateStore(): AppStateStore {
	const { set, subscribe } = writable<AppStateType>(AppStateType.UNINITIALIZED);

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

			const authData = get(authenticationStore);
			const isAuthenticated = !!authData?.accessToken;

			if (isAuthenticated) {
				set(AppStateType.INITIALIZING_USER_DATA);
				await Promise.all([userStore.init(), organizationStore.init()]);
				if (dev) console.info('User data stores initialized.');
			}
			connectionStore.init();

			set(AppStateType.READY);
		} catch (error) {
			set(AppStateType.ERROR);
			await showAlert('An error occurred during app initialization.', { type: AlertType.ERROR });
			if (dev) {
				console.warn('AppStateStore initialization error:', error);
			}
		}
	}

	async function reset(): Promise<void> {
		await Promise.all([userStore.reset(), organizationStore.reset(), authenticationStore.reset()]);
		set(AppStateType.READY);
		isInitialized = false;
	}

	async function initializeUserData(): Promise<void> {
		try {
			set(AppStateType.INITIALIZING_USER_DATA);
			await Promise.all([userStore.init(), organizationStore.init()]);
			if (dev) console.info('User data stores initialized.');
			set(AppStateType.READY);
		} catch (error) {
			set(AppStateType.ERROR);
			await showAlert('An error occurred while loading user data.', { type: AlertType.ERROR });
			if (dev) {
				console.warn('AppStateStore user data initialization error:', error);
			}
		}
	}

	return {
		initialize,
		initializeUserData,
		reset,
		subscribe
	};
}

/**
 * App state store for managing application initialization and lifecycle.
 */
export const appStateStore = createAppStateStore();
