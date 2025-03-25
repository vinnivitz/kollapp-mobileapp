import type { UserModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';

/**
 * Store for user information.
 */
export type UserStore = BaseStore<UserModel>;
