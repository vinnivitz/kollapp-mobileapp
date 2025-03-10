import type { UserRole } from '$lib/models/api';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	surname: string;
	name: string;
	email: string;
	username: string;
	roles: UserRole[];
};
