import type { BaseStore } from './base-store.model';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	/** Candidate for removal */
	surname?: string;
	name: string;
	email: string;
	username: string;
};

/**
 * Store for user information.
 */
export type UserStore = BaseStore<UserModel> & {
	exists: () => Promise<boolean>;
};
