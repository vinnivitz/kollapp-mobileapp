import type { LoginDto, TokenDto } from '$lib/api/dto/client';
import type { UserTokenDto } from '$lib/api/dto/server';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';
import { authenticationStore, organizationStore, userStore } from '$lib/store';

const ENDPOINT = 'public/auth';

/**
 * Logs in a user and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<UserDto>>} validation result
 */
export async function login(model: LoginDto): Promise<ResponseBody<UserTokenDto>> {
	return customFetch(`${ENDPOINT}/signin`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE,
		silentOnError: true
	});
}

/**
 * Refreshes the access token
 * @param token refresh token
 * @returns {Promise<ResponseBody<AccessTokenDto>>} new access token
 */
export async function refresh(token: string): Promise<ResponseBody<TokenDto>> {
	return customFetch(`${ENDPOINT}/refresh`, {
		query: { token },
		authorizationType: AuthorizationType.NONE,
		silentOnError: true
	});
}

/**
 * Logs out the user by clearing authentication tokens and user information
 */
export async function logout(): Promise<void> {
	await Promise.all([authenticationStore.reset(), organizationStore.reset(), userStore.reset()]);
}
