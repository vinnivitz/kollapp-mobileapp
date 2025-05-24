import { derived } from 'svelte/store';

import { activitiesStore } from './activity.store';
import { authenticationStore } from './authentication.store';
import { organizationStore } from './organization.store';
import { userStore } from './user.store';

export const initializationStore = derived(
	[
		userStore.initialized,
		organizationStore.initialized,
		authenticationStore.initialized,
		activitiesStore.initialized,
		authenticationStore
	],
	([$userInit, $organizationInit, $authenticationInit, $activitiesInit, $authenticationStore]) => {
		return (
			($userInit && $organizationInit && $authenticationInit && $activitiesInit) ||
			($authenticationInit && !$authenticationStore)
		);
	}
);
