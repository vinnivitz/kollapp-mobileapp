import type { Readable } from 'svelte/store';

/**
 * Declares the base store interface with init, set, and reset methods.
 */
export type BaseStore<T = string> = Readable<T | undefined> & {
	init: () => Promise<void>;
	set: (value: T) => Promise<void>;
	reset: () => Promise<void>;
};
