import type { RegisterDto, ResetPasswordConfirmationDto, ResetPasswordDto } from '$lib/api/dto/client/authentication';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'public/user';

/**
 * Registers a new manager
 * @param model registration model
 * @returns {Promise<ResponseBody>} response body
 */
async function register(model: RegisterDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/signup`, {
		authorizationType: AuthorizationType.NONE,
		body: model,
		method: RequestMethod.POST
	});
}

/**
 * Sends a password reset email to the user
 * @param model email model
 * @returns {Promise<ResponseBody>} response body
 */
async function forgotPassword(model: ResetPasswordDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/forgot-password`, {
		authorizationType: AuthorizationType.NONE,
		body: model,
		method: RequestMethod.POST
	});
}

/**
 * Resets the user password
 * @param model password reset model
 * @returns {Promise<ResponseBody>} response body
 */
async function resetPassword(model: ResetPasswordConfirmationDto, token: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/reset-password`, {
		authorizationType: AuthorizationType.NONE,
		body: model,
		method: RequestMethod.POST,
		query: { token }
	});
}

/**
 * Resends the confirmation email
 * @param model email model
 * @returns {Promise<ResponseBody>}	response body
 */
async function resendConfirmation(model: ResetPasswordConfirmationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/confirmation`, {
		authorizationType: AuthorizationType.NONE,
		body: model,
		method: RequestMethod.POST
	});
}

export const publicUserResource = {
	forgotPassword,
	register,
	resendConfirmation,
	resetPassword
};
