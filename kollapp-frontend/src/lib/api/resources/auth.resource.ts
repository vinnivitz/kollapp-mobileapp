import type { LoginDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';
import { PreferencesKey, type OrganizationTokenModel, type TokenModel } from '$lib/models';
import { authenticationTokenStore } from '$lib/store';
import { removeStoredValue } from '$lib/utils';

const ENDPOINT = 'public/auth';

/**
 * Logs in a organization and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<OrganizationDto>>} validation result
 */
export async function login(model: LoginDto): Promise<ResponseBody<OrganizationTokenModel>> {
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
 * @returns {Promise<ResponseBody<AccessTokenDto>>}
 */
export async function refresh(token: string): Promise<ResponseBody<TokenModel>> {
	return customFetch(`${ENDPOINT}/refresh`, {
		query: { token },
		authorizationType: AuthorizationType.NONE,
		silentOnError: true
	});
}

export async function logout(): Promise<void> {
	await removeStoredValue(PreferencesKey.ACCESS_TOKEN);
	authenticationTokenStore.set(undefined);
	await removeStoredValue(PreferencesKey.REFRESH_TOKEN);
	await removeStoredValue(PreferencesKey.ORGANIZATION);
}
