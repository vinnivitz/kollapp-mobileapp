import type { LoginDto, AccessTokenDto, TokenDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';
import { PreferencesKey } from '$lib/models';
import { removeStoredValue } from '$lib/utils';

const ENDPOINT = 'public/auth';

/**
 * Logs in a organization and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<TokenDto>>} validation result
 */
export async function login(model: LoginDto, silent = true): Promise<ResponseBody<TokenDto>> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/signin`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE,
		silent
	});
}

/**
 * Refreshes the access token
 * @param token refresh token
 * @returns {Promise<ResponseBody<AccessTokenDto>>}
 */
export async function refresh(token: string, silent = true): Promise<ResponseBody<AccessTokenDto>> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/refresh`),
		query: { token },
		authorizationType: AuthorizationType.NONE,
		silent
	});
}

export async function logout(): Promise<void> {
	await removeStoredValue(PreferencesKey.ACCESS_TOKEN);
	await removeStoredValue(PreferencesKey.REFRESH_TOKEN);
	await removeStoredValue(PreferencesKey.ORGANIZATION);
}
