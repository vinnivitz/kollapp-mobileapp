import type { EmailDto } from '../dto/email.dto';

import type { RegisterDto, ResetPasswordDto } from '$lib/api/dto';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'public/organization';

/**
 * Registers a new organization and returns the validation result
 * @param model registration model
 * @returns {Promise<ResponseBody>}
 */
export async function register(model: RegisterDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/signup`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE
	});
}

/**
 * Sends a password reset email to the organization
 * @param model email model
 * @returns {Promise<ResponseBody>}
 */
export async function forgotPassword(model: EmailDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/forgot-password`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE
	});
}

/**
 * Resets the organization password
 * @param model password reset model
 * @returns {Promise<ResponseBody>}
 */
export async function resetPassword(model: ResetPasswordDto, token: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/reset-password`, {
		query: { token },
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE
	});
}

/**
 * Resends the confirmation email
 * @param model email model
 * @returns {Promise<ResponseBody>}
 */
export async function resendConfirmation(model: EmailDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/resend-confirmation`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE
	});
}
