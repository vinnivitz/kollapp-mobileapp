import { get, writable, type Writable } from 'svelte/store';

import { apiResources } from '$lib/api';
import { StatusChecks } from '$lib/api/utils';
import { PreferencesKey, type OrganizationModel } from '$lib/models';
import { getStoredValue, removeStoredValue, storeValue } from '$lib/utils';

function createOrganizationStore(): Writable<OrganizationModel | undefined> & {
	init: (organization?: OrganizationModel) => Promise<void>;
} {
	const { subscribe, set, update } = writable<OrganizationModel | undefined>();

	async function setOrganization(organization?: OrganizationModel): Promise<void> {
		await (organization
			? storeValue(PreferencesKey.ORGANIZATION, organization)
			: removeStoredValue(PreferencesKey.ORGANIZATION));
		set(organization);
	}

	async function init(organization?: OrganizationModel): Promise<void> {
		if (organization) {
			return setOrganization(organization);
		} else if (get(organizationStore)) {
			return;
		} else if (!(await getStoredValue<OrganizationModel>(PreferencesKey.ACCESS_TOKEN))) {
			return setOrganization();
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
