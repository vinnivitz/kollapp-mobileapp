import type { AccountPostingModel } from '$lib/models/models';
import type { AccountPostingsStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

import { accountingResource } from '$lib/api/resources';
import { PreferencesKey } from '$lib/models/preferences';
import { getStoredValue, removeStoredValue, StatusCheck, storeValue } from '$lib/utility';

function createStore(): AccountPostingsStore {
	const { set, subscribe } = writable<AccountPostingModel[] | undefined>();
	const initialized = writable(false);

	async function init(): Promise<void> {
		const organizationId = await getStoredValue<number>(PreferencesKey.SELECTED_ORGANIZATION_ID);
		if (organizationId) {
			const response = await accountingResource.getAccountPostings(organizationId);
			if (StatusCheck.isOK(response.status)) {
				_set(response.data.postings);
			} else if (StatusCheck.serverNotReachable(response.status)) {
				const postings = await getStoredValue<AccountPostingModel[]>(PreferencesKey.ACCOUNT_POSTINGS);
				if (postings) {
					_set(postings);
				}
			}
		} else {
			_set();
		}
		initialized.set(true);
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
		initialized.set(false);
		_set();
	}

	return {
		init,
		initialized,
		reset,
		set: _set,
		subscribe,
		update
	};
}

/**
 * Store for handling the account postings of the current .
 */
export const accountPostingsStore = createStore();
