import type { InitializationModel } from '$lib/models/stores';
import type { ActivityTO, OrganizationMinifiedTO, OrganizationTO, PostingTO } from '@kollapp/api-types';
import type { Readable, Writable } from 'svelte/store';

/**
 * Store for organization information.
 */
export type OrganizationStore = Readable<OrganizationTO | undefined> &
	InitializationModel & {
		organizations: Writable<OrganizationMinifiedTO[]>;
		createActivity(activity: ActivityTO): Promise<void>;
		createActivityPosting(activityId: number, posting: PostingTO): Promise<void>;
		createOrganizationPosting(posting: PostingTO): Promise<void>;
		initialize: (organizationId?: number) => Promise<void>;
		removeActivity(activityId: number): Promise<void>;
		removeActivityPosting(activityId: number, postingId: number): Promise<void>;
		removeOrganizationPosting(postingId: number): Promise<void>;
		reset: () => Promise<void>;
		set: (value: OrganizationTO) => Promise<void>;
		update: (organizationId?: number) => Promise<void>;
		updateActivity(activity: ActivityTO): Promise<void>;
		updateActivityPosting(activityId: number, posting: PostingTO): Promise<void>;
		updateOrganizationPosting(posting: PostingTO): Promise<void>;
		updateOrganizationPosting(posting: PostingTO): Promise<void>;
	};
