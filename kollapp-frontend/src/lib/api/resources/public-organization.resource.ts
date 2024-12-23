import type { EmailDto } from '../dto/email.dto';

import type { RegisterDto, ResetPasswordDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';

const ENDPOINT = 'public/organization';

/**
 * Registers a new organization and returns the validation result
 * @param model registration model
 * @returns {Promise<ResponseBody>} validation result
 */
export async function register(model: RegisterDto, silent = false): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/signup`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE,
		silent
	});
}

/**
 * Sends a password reset email to the organization
 * @param model email model
 * @returns {Promise<ResponseBody>} validation result
 */
export async function forgotPassword(model: EmailDto, silent = false): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/forgot-password`),
		options: { method: 'POST', body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE,
		silent
	});
}

/**
 * Resets the organization password
 * @param model password reset model
 * @returns {Promise<ResponseBody>} validation result
 */
export async function resetPassword(
	model: ResetPasswordDto,
	token: string,
	silent = false
): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/reset-password`),
		query: { token },
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		authorizationType: AuthorizationType.NONE,
		silent
	});
}
