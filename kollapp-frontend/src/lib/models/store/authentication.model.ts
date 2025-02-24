import type { BaseStore } from '$lib/models/store';

/**
 * Stores authentication tokens.
 */
export type AuthenticationModel = {
	accessToken?: string;
	refreshToken?: string;
};

/**
 * Store for authentication tokens.
 */
export type AuthenticationStore = BaseStore<AuthenticationModel>;
