import type { Readable } from 'svelte/store';

import type { ActivityModel } from '$lib/models/models';

/**
 * Store for activity information.
 */
export type ActivityStore = Readable<ActivityModel[]> & {
	init: (organizationId: string) => Promise<void>;
	set: (value: ActivityModel[]) => Promise<void>;
	reset: () => Promise<void>;
	change: (id: string) => Promise<void>;
	initialized: Readable<boolean>;
};
