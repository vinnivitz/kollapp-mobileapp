import type { ForgotPasswordRequestTO, KollappUserSignupRequestTO, ResetPasswordRequestTO } from '@kollapp/api-types';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class PublicUserService {
	private get base(): string {
		return 'public/user';
	}

	/** Registers a new manager
	 * @param model signup model
	 * @returns {Promise<ResponseBody>} response body
	 */
	register = async (model: KollappUserSignupRequestTO): Promise<ResponseBody> => {
		return customFetch(`${this.base}/signup`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST,
			offlineQueueable: false
		});
	};

	/** Sends a password reset email to the user
	 * @param model forgot password model
	 * @returns {Promise<ResponseBody>} response body
	 */
	forgotPassword = async (model: ForgotPasswordRequestTO): Promise<ResponseBody> => {
		return customFetch(`${this.base}/forgot-password`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST,
			offlineQueueable: false
		});
	};

	/** Resets the user password
	 * @param model reset password model
	 * @param token reset token
	 * @returns {Promise<ResponseBody>} response body
	 */
	resetPassword = async (model: ResetPasswordRequestTO, token: string): Promise<ResponseBody> => {
		return customFetch(`${this.base}/reset-password`, {
			authorizationType: AuthorizationType.NONE,
			body: model,
			method: RequestMethod.POST,
			offlineQueueable: false,
			query: { token }
		});
	};
}

export const publicUserService = new PublicUserService();
