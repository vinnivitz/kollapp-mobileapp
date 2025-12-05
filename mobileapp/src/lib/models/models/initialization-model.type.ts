import type { Readable } from 'svelte/store';

/**
 * Model representing the initialization state of the application.
 */
export type InitializationModel = {
	loadedCache: Readable<boolean>;
	loadedServer: Readable<boolean>;
};
