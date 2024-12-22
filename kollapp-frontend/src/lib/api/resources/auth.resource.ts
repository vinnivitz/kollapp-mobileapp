import type { LoginDto, RefreshTokenDto, TokenDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';

const ENDPOINT = 'public/auth';

/**
 * Logs in a user and returns the validation result
 * @param model login model
 * @returns {Promise<ResponseBody<TokenDto>>} validation result
 */
export async function login(model: LoginDto): Promise<ResponseBody<TokenDto>> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/signin`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE
	});
}

export async function refresh(token: string): Promise<ResponseBody<RefreshTokenDto>> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/refresh?token=${token}`),
		authorizationType: AuthorizationType.NONE
	});
}
