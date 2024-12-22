import type { EmailDto } from '../dto/email.dto';

import type { RegisterDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';

const ENDPOINT = 'public/organization';

/**
 * Registers a new user and returns the validation result
 * @param model registration model
 * @returns {Promise<ResponseBody>} validation result
 */
export async function register(model: RegisterDto): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/register`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE
	});
}

/**
 * Requests an email to reset the password
 * @param model email model
 * @returns {Promise<ResponseBody>}
 */
export async function requestPasswordReset(model: EmailDto): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/reset-password`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE
	});
}
