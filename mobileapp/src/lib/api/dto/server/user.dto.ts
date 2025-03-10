import type { UserRole } from '$lib/models/api';

/**
 * User DTO for retrieving basic user information.
 */
export type UserDto = {
	surname: string;
	name: string;
	email: string;
	username: string;
	roles: UserRole[];
};
