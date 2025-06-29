import type { InitializationModel } from '$lib/models/models';
import type { InitializationStore } from '$lib/models/stores';

import { derived, writable } from 'svelte/store';

import { accountPostingsStore } from './account-postings.store';
import { authenticationStore } from './authentication.store';
import { organizationStore } from './organization.store';
import { userStore } from './user.store';

function createStore(): InitializationStore {
	const loadedCache = derived(
		[
			userStore.loadedCache,
			organizationStore.loadedCache,
			accountPostingsStore.loadedCache,
			authenticationStore.initialized,
			authenticationStore
		],
		([
			$userStoreCache,
			$organizationStoreCache,
			$accountPostingsStoreCache,
			$authenticationInit,
			$authenticationStore
		]) => {
			return (
				($userStoreCache && $organizationStoreCache && $accountPostingsStoreCache && $authenticationInit) ||
				($authenticationInit && !$authenticationStore)
			);
		}
	);

	const loadedServer = derived(
		[
			userStore.loadedServer,
			organizationStore.loadedServer,
			accountPostingsStore.loadedServer,
			authenticationStore.initialized,
			authenticationStore
		],
		([
			$userStoreServer,
			$organizationStoreServer,
			$accountPostingsStoreServer,
			$authenticationInit,
			$authenticationStore
		]) => {
			return (
				($userStoreServer && $organizationStoreServer && $accountPostingsStoreServer && $authenticationInit) ||
				($authenticationInit && !$authenticationStore)
			);
		}
	);

	const model: InitializationModel = {
		loadedCache,
		loadedServer
	};

	const { subscribe } = writable(model);

	return { subscribe };
}

export const initializationStore = createStore();
