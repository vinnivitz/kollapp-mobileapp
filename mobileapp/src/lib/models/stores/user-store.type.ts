import type { UserModel } from '$lib/models/models';
import type { BaseStore } from '$lib/models/stores';
import type { Writable } from 'svelte/store';

/**
 * Store for user information.
 */
export type UserStore = BaseStore<UserModel> & { loadedCache: Writable<boolean>; loadedServer: Writable<boolean> };
