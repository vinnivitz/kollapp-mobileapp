import type { UserDto } from '$lib/api/dto/server';
import type { LoadableStore } from '$lib/models/stores';

/**
 * Store for user information.
 */
export type UserStore = LoadableStore<UserDto>;
