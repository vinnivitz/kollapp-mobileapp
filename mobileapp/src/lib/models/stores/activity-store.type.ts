import type { ActivityModel } from '$lib/models/models';
import type { Readable } from 'svelte/store';

/**
 * Store for activity information.
 */
export type ActivityStore = Readable<ActivityModel[]> & {
	initialized: Readable<boolean>;
	change: (id: number) => Promise<void>;
	init: (organizationId: number) => Promise<void>;
	reset: () => Promise<void>;
	set: (value: ActivityModel[]) => Promise<void>;
};
