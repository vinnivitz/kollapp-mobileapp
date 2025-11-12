import type { AppStateType } from '$lib/models/ui';
import type { Readable } from 'svelte/store';

/**
 * Store for managing application initialization state and lifecycle
 */
export type AppStateStore = Readable<AppStateType> & {
	initialize: () => Promise<void>;
	initializeUserData: () => Promise<void>;
	reset: () => Promise<void>;
};
