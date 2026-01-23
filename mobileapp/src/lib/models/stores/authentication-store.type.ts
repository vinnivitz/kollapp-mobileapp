import type { BaseStore } from '$lib/models/stores';
import type { AuthTokensTO } from '@kollapp/api-types';
import type { Writable } from 'svelte/store';

/**
 * Store for authentication tokens.
 */
export type AuthenticationStore = BaseStore<AuthTokensTO> & {
	initialized: Writable<boolean>;
};
