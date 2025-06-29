import type { UserModel } from '$lib/models/models';
import type { LoadableStore } from '$lib/models/stores';

/**
 * Store for user information.
 */
export type UserStore = LoadableStore<UserModel>;
