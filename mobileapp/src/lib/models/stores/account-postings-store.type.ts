import type { BaseStore } from './base-store.type';
import type { AccountPostingModel } from '../models/account-posting-model.type';
import type { Writable } from 'svelte/store';

export type AccountPostingsStore = BaseStore<AccountPostingModel[]> & {
	initialized: Writable<boolean>;
	update: (organizationId: number) => Promise<void>;
};
