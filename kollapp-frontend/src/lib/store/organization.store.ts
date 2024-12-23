import { get, writable, type Writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import type { OrganizationModel } from '$lib/api/models';
import { StatusChecks } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createOrganizationStore(): Writable<OrganizationModel | undefined> & {
	init: () => Promise<void>;
} {
	const { subscribe, set, update } = writable<OrganizationModel | undefined>();

	async function setOrganization(organization?: OrganizationModel): Promise<void> {
		set(organization);
		if (organization) {
			await storeValue(PreferencesKey.ORGANIZATION, organization);
		} else {
			set(undefined);
			await removeStoredValue(PreferencesKey.ORGANIZATION);
		}
	}

	async function init(): Promise<void> {
		if (get(organizationStore)) {
			return;
		}
		const body = await apiResources.organization.getOrganization();
		if (StatusChecks.isOK(body.status)) {
			return setOrganization({ username: body.data.username, email: body.data.email });
		}
		return StatusChecks.isUnauthorized(body.status)
			? setOrganization()
			: setOrganization(await getStoredValue<OrganizationModel>(PreferencesKey.ORGANIZATION));
	}

	return {
		subscribe,
		update,
		set: setOrganization,
		init
	};
}

/**
 * Organization store for handling the current organization information.
 */
export const organizationStore = createOrganizationStore();
