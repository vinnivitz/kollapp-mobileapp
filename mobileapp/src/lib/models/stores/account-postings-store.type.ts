import type { AccountPostingModel } from '$lib/models/models';
import type { LoadableStore } from '$lib/models/stores';

type Replace<T, K extends keyof T, V> = {
	[P in keyof T]: P extends K ? V : T[P];
};

/**
 * Store for account postings.
 */
export type AccountPostingsStore = Replace<
	LoadableStore<AccountPostingModel[]>,
	'init',
	(organizationId?: number) => Promise<void>
> & {
	getTotalBudget: () => number;
	update: (organizationId: number) => Promise<void>;
};
