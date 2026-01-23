import type { Readable } from 'svelte/store';

/**
 * Store for initialization state of the application.
 */
export type InitializationStore = InitializationModel & { loaded: Readable<boolean> };

/**
 * Model representing the initialization state of the application.
 */
export type InitializationModel = {
	loadedCache: Readable<boolean>;
	loadedServer: Readable<boolean>;
};
