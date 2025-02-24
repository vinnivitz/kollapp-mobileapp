import type { AuthenticationTokenDto, UserDto } from '$lib/api/dto/server';

/**
 * User and authentication token DTO for retrieving authentication tokens and basic user information.
 */
export type UserTokenDto = UserDto & AuthenticationTokenDto;
