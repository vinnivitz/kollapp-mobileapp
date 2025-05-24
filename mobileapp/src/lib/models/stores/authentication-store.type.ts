import type { AuthenticationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for authentication tokens.
 */
export type AuthenticationStore = BaseStore<AuthenticationModel> & {
	initialized: Writable<boolean>;
};
