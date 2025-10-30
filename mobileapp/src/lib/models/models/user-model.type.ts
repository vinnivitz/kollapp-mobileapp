import type { UserRole } from '../api';

/**
 * Stores basic information about a user.
 */
export type UserModel = {
	email: string;
	id: number;
	role: UserRole;
	username: string;
};
