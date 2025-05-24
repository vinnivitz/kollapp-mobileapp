import type { ActivityModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for activity information.
 */
export type ActivityStore = BaseStore<ActivityModel[]> & {
	initialized: Writable<boolean>;
	change: (id: number) => Promise<void>;
};
