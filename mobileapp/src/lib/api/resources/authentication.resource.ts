import type { LoginDto } from '$lib/api/dto/client/authentication';
import type { TokenDto, UserAuthenticationDto } from '$lib/api/dto/server';

import { goto } from '$app/navigation';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { PageRoute } from '$lib/models/routing';
import { appStateStore } from '$lib/stores';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'public/auth';

/**
 * Logs in a user and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<UserDto>>} validation result
 */
async function login(model: LoginDto): Promise<ResponseBody<UserAuthenticationDto>> {
	return customFetch(`${ENDPOINT}/signin`, {
		authorizationType: AuthorizationType.NONE,
		body: model,
		method: RequestMethod.POST,
		silentOnSuccess: true
	});
}

/**
 * Refreshes the access token
 * @param token refresh token
 * @returns {Promise<ResponseBody<AccessTokenDto>>} new access token
 */
async function refresh(token: string): Promise<ResponseBody<TokenDto>> {
	return customFetch(`${ENDPOINT}/refresh`, {
		authorizationType: AuthorizationType.NONE,
		query: { token },
		silentOnSuccess: true
	});
}

/**
 * Logs out the user by clearing authentication tokens and user information
 */
async function logout(): Promise<void> {
	await appStateStore.reset();
	await goto(PageRoute.AUTH.LOGIN);
}

export const authenticationResource = {
	login,
	logout,
	refresh
};
