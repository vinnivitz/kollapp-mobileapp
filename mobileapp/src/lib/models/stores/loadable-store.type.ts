import type { InitializationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';

/**
 * Loadable store type that combines a base store with loadable model properties.
 *
 * @template T - The type of the data stored in the store.
 */
export type LoadableStore<T> = BaseStore<T> & InitializationModel;
