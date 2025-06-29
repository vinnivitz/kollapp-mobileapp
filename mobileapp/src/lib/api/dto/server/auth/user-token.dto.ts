import type { AuthenticationTokenDto, UserDto } from '$lib/api/dto/server';

/**
 * Data Transfer Object for user token information.
 */
export type UserTokenDto = UserDto & AuthenticationTokenDto;
