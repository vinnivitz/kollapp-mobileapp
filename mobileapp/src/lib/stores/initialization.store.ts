import { derived } from 'svelte/store';

import { authenticationStore } from './authentication.store';
import { organizationStore } from './organization.store';
import { userStore } from './user.store';

export const initializationStore = derived(
	[userStore.initialized, organizationStore.initialized, authenticationStore.initialized, authenticationStore],
	([$userInit, $organizationInit, $authenticationInit, $authenticationStore]) => {
		return ($userInit && $organizationInit && $authenticationInit) || ($authenticationInit && !$authenticationStore);
	}
);
