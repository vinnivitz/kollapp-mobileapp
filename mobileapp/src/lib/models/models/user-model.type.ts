import type { UserRole } from '$lib/models/api';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	email: string;
	roles: UserRole[];
	username: string;
};
