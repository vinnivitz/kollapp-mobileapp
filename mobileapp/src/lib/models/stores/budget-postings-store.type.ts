import type { BaseStore } from './base-store.type';
import type { BudgetPostingModel } from '../models/budget-posting-model.type';
import type { Writable } from 'svelte/store';

export type BudgetPostingsStore = BaseStore<BudgetPostingModel[]> & {
	initialized: Writable<boolean>;
	update: (organizationId: number) => Promise<void>;
};
