import type { OrganizationStore } from '$lib/models/stores';
import type { ActivityTO, OrganizationMinifiedTO, OrganizationTO, PostingTO } from '@kollapp/api-types';

import { get, writable } from 'svelte/store';

import { organizationService } from '$lib/api/services';
import { StorageKey } from '$lib/models/storage';
import { getOrganizationId, getStoredValue, removeStoredValue, startTour, StatusCheck, storeValue } from '$lib/utility';

function createStore(): OrganizationStore {
	const { set, subscribe } = writable<OrganizationTO | undefined>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);
	const organizations = writable<OrganizationMinifiedTO[]>([]);

	async function initialize(organizationId?: number): Promise<void> {
		const storedOrganization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (storedOrganization) {
			organizations.set([storedOrganization]);
			set(storedOrganization);
			loadedCache.set(true);
		}

		const response = await organizationService.getAll();

		if (StatusCheck.isOK(response.status)) {
			const allOrganizations = response.data;
			organizations.set(allOrganizations);

			organizationId = organizationId ?? storedOrganization?.id ?? allOrganizations[0]?.id;

			await (organizationId ? update(organizationId) : _set());
			if (get(organizationStore)) {
				void startTour();
			}
		} else if (StatusCheck.isUnauthorized(response.status)) {
			await _set();
		}
		loadedServer.set(true);
	}

	async function _set(model?: OrganizationTO): Promise<void> {
		await (model ? storeValue(StorageKey.ORGANIZATION, model) : removeStoredValue(StorageKey.ORGANIZATION));
		set(model);
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	async function update(id?: number): Promise<void> {
		id = id ?? getOrganizationId()!;

		const response = await organizationService.getById(id);
		if (StatusCheck.isOK(response.status)) {
			await _set(response.data);
		}
	}

	async function createActivity(activity: ActivityTO): Promise<void> {
		const organization = get(organizationStore);
		if (!organization) return;

		organization.activities.push(activity);
		await _set(organization);
	}

	async function updateActivity(activity: ActivityTO): Promise<void> {
		const organization = get(organizationStore);
		if (!organization) return;

		const activityIndex = organization.activities.findIndex((a) => a.id === activity.id);
		if (activityIndex !== -1) {
			organization.activities[activityIndex] = activity;
			await _set(organization);
		}
	}

	async function removeActivity(activityId: number): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		organization.activities = organization.activities.filter((activity) => activity.id !== activityId);
		await _set(organization);
	}

	async function createOrganizationPosting(posting: PostingTO): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		organization.organizationPostings.push(posting);
		await _set(organization);
	}

	async function createActivityPosting(activityId: number, posting: PostingTO): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		const activity = organization.activities.find((activity) => activity.id === activityId);
		if (!activity) return;

		activity.activityPostings.push(posting);
		await _set(organization);
	}

	async function updateOrganizationPosting(posting: PostingTO): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		const postingIndex = organization.organizationPostings.findIndex(
			(organizationPosting) => organizationPosting.id === posting.id
		);
		if (postingIndex !== -1) {
			organization.organizationPostings[postingIndex] = posting;
			await _set(organization);
		}
	}

	async function updateActivityPosting(activityId: number, posting: PostingTO): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		const activity = organization.activities.find((activity) => activity.id === activityId);
		if (!activity) return;

		const postingIndex = activity.activityPostings.findIndex((p) => p.id === posting.id);
		if (postingIndex !== -1) {
			activity.activityPostings[postingIndex] = posting;
			await _set(organization);
		}
	}

	async function removeOrganizationPosting(postingId: number): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		organization.organizationPostings = organization.organizationPostings.filter((posting) => posting.id !== postingId);
		await _set(organization);
	}

	async function removeActivityPosting(activityId: number, postingId: number): Promise<void> {
		const organization = await getStoredValue<OrganizationTO>(StorageKey.ORGANIZATION);
		if (!organization) return;

		const activity = organization.activities.find((activity) => activity.id === activityId);
		if (!activity) return;

		activity.activityPostings = activity.activityPostings.filter((posting) => posting.id !== postingId);
		await _set(organization);
	}

	return {
		createActivity,
		createActivityPosting,
		createOrganizationPosting,
		initialize,
		loadedCache,
		loadedServer,
		organizations,
		removeActivity,
		removeActivityPosting,
		removeOrganizationPosting,
		reset,
		set: _set,
		subscribe,
		update,
		updateActivity,
		updateActivityPosting,
		updateOrganizationPosting
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createStore();
