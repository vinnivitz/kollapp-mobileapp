import type { RegisterDto, ResetPasswordConfirmationDto } from '$lib/api/dto/client/auth';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'public/user';

/**
 * Registers a new manager
 * @param model registration model
 * @returns {Promise<ResponseBody>} response body
 */
export async function registerManager(model: RegisterDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/manager-signup`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Sends a password reset email to the user
 * @param model email model
 * @returns {Promise<ResponseBody>} response body
 */
export async function forgotPassword(model: ResetPasswordConfirmationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/forgot-password`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Resets the user password
 * @param model password reset model
 * @returns {Promise<ResponseBody>} response body
 */
export async function resetPassword(model: ResetPasswordConfirmationDto, token: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/reset-password`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify(model),
		method: RequestMethod.POST,
		query: { token }
	});
}

/**
 * Resends the confirmation email
 * @param model email model
 * @returns {Promise<ResponseBody>}	response body
 */
export async function resendConfirmation(model: ResetPasswordConfirmationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/resend-confirmation`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}
