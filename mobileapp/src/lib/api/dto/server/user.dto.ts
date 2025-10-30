import type { UserRole } from '$lib/models/api';

/**
 * Data Transfer Object for user information.
 */
export type UserDto = {
	email: string;
	id: number;
	role: UserRole;
	username: string;
};
