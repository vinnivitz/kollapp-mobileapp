import { derived } from 'svelte/store';

import { activitiesStore, authenticationStore, organizationStore, userStore } from '$lib/stores';

export const initializationStore = derived(
	[userStore.initialized, organizationStore.initialized, authenticationStore.initialized, activitiesStore.initialized],
	([userInit, organizationInit, authenticationInit, activitiesInit]) => {
		return userInit && organizationInit && authenticationInit && activitiesInit;
	}
);
