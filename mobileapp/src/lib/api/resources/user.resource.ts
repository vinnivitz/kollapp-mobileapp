import type { KollappUserTO, KollappUserUpdateRequestTO, PasswordChangeRequestTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class UserResource {
	ENDPOINT = 'user';

	/** Gets the data of authenticated user
	 * @returns {Promise<ResponseBody<KollappUserTO>>} response body
	 */
	async get(): Promise<ResponseBody<KollappUserTO>> {
		return customFetch(this.ENDPOINT, { silentOnSuccess: true });
	}

	/** Changes the password of the authenticated user
	 * @param model password change model
	 * @returns {Promise<ResponseBody>} response body
	 */
	async changePassword(model: PasswordChangeRequestTO): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/change-password`, {
			body: model,
			method: RequestMethod.PATCH
		});
	}

	/** Updates the data of the authenticated user
	 * @param model user update model
	 * @returns {Promise<ResponseBody<KollappUserTO>>} response body
	 */
	async update(model: KollappUserUpdateRequestTO): Promise<ResponseBody<KollappUserTO>> {
		return customFetch(`${this.ENDPOINT}/update-information`, {
			body: model,
			method: RequestMethod.PATCH
		});
	}

	/** Deletes the account of the authenticated user
	 * @returns {Promise<ResponseBody>} response body
	 */
	async remove(): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/delete`, {
			method: RequestMethod.DELETE
		});
	}
}

export const userResource = new UserResource();
