import type { Readable } from 'svelte/store';

/**
 * Loadable model type that includes properties for tracking loading states.
 */
export type LoadableModel = {
	loadedCache: Readable<boolean>;
	loadedServer: Readable<boolean>;
};
