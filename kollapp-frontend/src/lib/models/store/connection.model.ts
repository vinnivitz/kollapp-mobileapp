import type { BaseStore } from './base-store.model';

/**
 * Store for connection information.
 */
export type ConnectionStore = BaseStore<boolean> & {
	check: () => void;
};
