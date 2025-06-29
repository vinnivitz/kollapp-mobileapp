import type { AccountPostingModel, OrganizationModel } from '$lib/models/models';
import type { AccountPostingsStore } from '$lib/models/stores';

import { get, writable } from 'svelte/store';

import { accountingResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): AccountPostingsStore {
	const { set, subscribe } = writable<AccountPostingModel[] | undefined>();
	const loadedCache = writable(false);
	const loadedServer = writable(false);

	async function init(): Promise<void> {
		const storedPostings = await getStoredValue<AccountPostingModel[]>(PreferencesKey.ACCOUNT_POSTINGS);
		if (storedPostings) {
			await _set(storedPostings);
			loadedCache.set(true);
		}

		const organization = await getStoredValue<OrganizationModel>(PreferencesKey.ORGANIZATION);
		const organizationId = organization?.id;
		if (organizationId) {
			const response = await accountingResource.getAccountPostings(organizationId);
			if (StatusCheck.isOK(response.status)) {
				_set(response.data.postings);
			}
		} else {
			_set();
		}
		loadedServer.set(true);
	}

	async function _set(model?: AccountPostingModel[]): Promise<void> {
		await (model
			? storeValue(PreferencesKey.ACCOUNT_POSTINGS, model)
			: removeStoredValue(PreferencesKey.ACCOUNT_POSTINGS));
		set(model);
	}

	async function update(organizationId: number): Promise<void> {
		const response = await accountingResource.getAccountPostings(organizationId);
		if (StatusCheck.isOK(response.status)) {
			await _set(response.data.postings);
		}
	}

	async function reset(): Promise<void> {
		loadedCache.set(false);
		loadedServer.set(false);
		await _set();
	}

	return {
		getTotalBudget,
		init,
		loadedCache,
		loadedServer,
		reset,
		set: _set,
		subscribe,
		update
	};
}

function getTotalBudget(): number {
	const postings = get(accountPostingsStore);
	return postings ? postings.reduce((total, posting) => total + posting.amountInCents, 0) : 0;
}

/**
 * Store for handling the account postings of the current .
 */
export const accountPostingsStore = createStore();
