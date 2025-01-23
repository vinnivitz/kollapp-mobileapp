import type { AuthenticationTokenDto, UserDto } from '.';

/**
 * User and authentication token DTO for retrieving authentication tokens and basic user information.
 */
export type UserTokenDto = UserDto & AuthenticationTokenDto;
