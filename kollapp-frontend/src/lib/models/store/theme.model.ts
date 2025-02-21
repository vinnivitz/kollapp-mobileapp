import type { Theme } from '../theme';

import type { BaseStore } from './base-store.model';

/**
 * Theme store model.
 */
export type ThemeStore = BaseStore<Theme> & {
	toggle: () => void;
};
