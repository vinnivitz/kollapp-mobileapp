import type { UserRole } from '$lib/models/api';

/**
 * User DTO for retrieving basic user information.
 */
export type UserDto = {
	email: string;
	roles: UserRole[];
	username: string;
};
