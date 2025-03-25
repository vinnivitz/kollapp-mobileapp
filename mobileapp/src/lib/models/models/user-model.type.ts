import type { UserRole } from '$lib/models/api';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	email: string;
	name: string;
	roles: UserRole[];
	surname: string;
	username: string;
	initialized?: boolean;
};
