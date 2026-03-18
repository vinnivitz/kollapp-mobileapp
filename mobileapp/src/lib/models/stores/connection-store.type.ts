import type { BaseStore } from '$lib/models/stores';

/**
 * Store for connection information.
 */
export type ConnectionStore = BaseStore<boolean> & {
	check: () => void;
	destroy: () => Promise<void>;
};
