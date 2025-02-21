import type { EmailDto } from '../dto/client/email.dto';

import type { RegisterDto, ResetPasswordDto } from '$lib/api/dto/client';
import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'public/user';

/**
 * Registers a new manager
 * @param model registration model
 * @returns {Promise<ResponseBody>}
 */
export async function registerManager(model: RegisterDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/manager-signup`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		authorizationType: AuthorizationType.NONE,
		silentOnSuccess: false
	});
}

/**
 * Sends a password reset email to the user
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
 * Resets the user password
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
