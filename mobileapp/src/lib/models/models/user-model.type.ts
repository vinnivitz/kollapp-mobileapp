import type { UserRole } from '$lib/models/api';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	email: string;
	id: number;
	roles: UserRole[];
	username: string;
};
