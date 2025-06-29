import type { UserRole } from '$lib/models/api';

/**
 * Data Transfer Object for user information.
 */
export type UserDto = {
	email: string;
	id: number;
	roles: UserRole[];
	username: string;
};
