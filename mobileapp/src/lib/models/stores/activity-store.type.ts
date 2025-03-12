import type { Readable } from 'svelte/store';

import type { ActivityModel } from '$lib/models/models';

/**
 * Store for activity information.
 */
export type ActivityStore = Readable<ActivityModel[]> & {
	change: (id: string) => Promise<void>;
	init: (organizationId: string) => Promise<void>;
	initialized: Readable<boolean>;
	reset: () => Promise<void>;
	set: (value: ActivityModel[]) => Promise<void>;
};
