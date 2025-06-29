import { derived } from 'svelte/store';

import { accountPostingsStore } from './account-postings.store';
import { authenticationStore } from './authentication.store';
import { organizationStore } from './organization.store';
import { userStore } from './user.store';

export const initializationStore = derived(
	[
		userStore.loadedCache,
		userStore.loadedServer,
		organizationStore.loadedCache,
		organizationStore.loadedServer,
		accountPostingsStore.loadedCache,
		accountPostingsStore.loadedServer,
		authenticationStore.initialized,
		authenticationStore
	],
	([
		$userStoreCache,
		$userStoreServer,
		$organizationStoreCache,
		$organizationStoreServer,
		$accountPostingsStoreCache,
		$accountPostingsStoreServer,
		$authenticationInit,
		$authenticationStore
	]) => {
		return (
			(($userStoreCache || $userStoreServer) &&
				($organizationStoreCache || $organizationStoreServer) &&
				($accountPostingsStoreCache || $accountPostingsStoreServer) &&
				$authenticationInit) ||
			($authenticationInit && !$authenticationStore)
		);
	}
);
