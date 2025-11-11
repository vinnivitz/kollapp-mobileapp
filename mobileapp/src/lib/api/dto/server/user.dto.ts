import type { OrganizationRole, UserRole } from '$lib/models/api';

/**
 * Data Transfer Object for user information.
 */
export type UserDto = {
	activated: boolean;
	email: string;
	id: number;
	role: OrganizationRole | UserRole;
	username: string;
};
