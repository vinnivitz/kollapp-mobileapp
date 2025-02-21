import type { BaseStore } from './base-store.model';

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
