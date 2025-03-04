import type { BaseStore } from '$lib/models/store';

/**
 * Store for connection information.
 */
export type ConnectionStore = BaseStore<boolean> & {
	check: () => void;
};
