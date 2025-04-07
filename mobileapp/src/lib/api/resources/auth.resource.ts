import type { LoginDto } from '$lib/api/dto/client/auth';
import type { TokenDto, UserTokenDto } from '$lib/api/dto/server';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { activitiesStore, authenticationStore, organizationStore, userStore } from '$lib/stores';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'public/auth';

/**
 * Logs in a user and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<UserDto>>} validation result
 */
export async function login(model: LoginDto): Promise<ResponseBody<UserTokenDto>> {
	return customFetch(`${ENDPOINT}/signin`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify(model),
		method: RequestMethod.POST,
		silentOnSuccess: true
	});
}

/**
 * Refreshes the access token
 * @param token refresh token
 * @returns {Promise<ResponseBody<AccessTokenDto>>} new access token
 */
export async function refresh(token: string): Promise<ResponseBody<TokenDto>> {
	return customFetch(`${ENDPOINT}/refresh`, {
		authorizationType: AuthorizationType.NONE,
		query: { token },
		silentOnSuccess: true
	});
}

/**
 * Logs out the user by clearing authentication tokens and user information
 */
export async function logout(): Promise<void> {
	await Promise.all([
		authenticationStore.reset(),
		organizationStore.reset(),
		userStore.reset(),
		activitiesStore.reset()
	]);
}
