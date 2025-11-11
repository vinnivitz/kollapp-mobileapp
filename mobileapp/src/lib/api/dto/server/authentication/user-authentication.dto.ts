import type { AuthenticationTokenDto } from '$lib/api/dto/server';

/**
 * Data Transfer Object for user authentication information.
 */
export type UserAuthenticationDto = AuthenticationTokenDto & {
	email: string;
	loggedInUntil: number;
	username: string;
};
