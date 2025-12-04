import type { LoadableModel } from '$lib/models/models';
import type { AuthenticationStore, InitializationStore } from '$lib/models/stores';

import { derived, writable } from 'svelte/store';

import { authenticationStore } from './authentication.store';
import { organizationStore } from './organization.store';
import { userStore } from './user.store';

/**
 * Add new loadable stores to this array to include them in the initialization process.
 */
const stores = [userStore, organizationStore] as const;

function createStore(): InitializationStore {
	const model = combineInitialization(stores, authenticationStore);

	const { subscribe } = writable(model);

	return { subscribe };
}

function combineInitialization(stores: readonly LoadableModel[], authStore: AuthenticationStore): LoadableModel {
	const cacheDependencies = stores.map((store) => store.loadedCache);
	const serverDependencies = stores.map((store) => store.loadedServer);

	const loadedCache = derived([...cacheDependencies, authStore.initialized, authStore], (values) => {
		const caches = values.slice(0, stores.length);
		const authInit = !!values[stores.length];
		const auth = values[stores.length + 1];
		return (caches.every(Boolean) && authInit) || (authInit && !auth);
	});

	const loadedServer = derived([...serverDependencies, authStore.initialized, authStore], (values) => {
		const servers = values.slice(0, stores.length);
		const authInit = !!values[stores.length];
		const auth = values[stores.length + 1];
		return (servers.every(Boolean) && authInit) || (authInit && !auth);
	});

	return { loadedCache, loadedServer };
}

/**
 * Initialization store for tracking the loading state of loadable stores.
 */
export const initializationStore = createStore();
