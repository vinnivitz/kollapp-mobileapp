import type { ActivityModel } from '$lib/models/models';
import type { Readable } from 'svelte/store';

/**
 * Store for activity information.
 */
export type ActivityStore = Readable<ActivityModel[]> & {
	initialized: Readable<boolean>;
	change: (id: string) => Promise<void>;
	init: (organizationId: string) => Promise<void>;
	reset: () => Promise<void>;
	set: (value: ActivityModel[]) => Promise<void>;
};
