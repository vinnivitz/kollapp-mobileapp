import type { AuthenticationModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';

/**
 * Store for authentication tokens.
 */
export type AuthenticationStore = BaseStore<AuthenticationModel>;
