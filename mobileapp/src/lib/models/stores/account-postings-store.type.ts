import type { AccountPostingModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

type Replace<T, K extends keyof T, V> = {
	[P in keyof T]: P extends K ? V : T[P];
};

export type AccountPostingsStore = Replace<
	BaseStore<AccountPostingModel[]>,
	'init',
	(organizationId: number) => Promise<void>
> & {
	loadedCache: Writable<boolean>;
	loadedServer: Writable<boolean>;
	getTotalBudget: () => number;
	update: (organizationId: number) => Promise<void>;
};
