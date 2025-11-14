import type { KollappUserTO, KollappUserUpdateRequestTO, PasswordChangeRequestTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'user';

/**
 * Gets the data of authenticated user
 * @returns {Promise<ResponseBody<KollappUserTO>>} response body
 */
async function get(): Promise<ResponseBody<KollappUserTO>> {
	return customFetch(ENDPOINT, { silentOnSuccess: true });
}

/**
 * Changes the password of the authenticated user
 * @param model change password model
 * @returns {Promise<ResponseBody>} response body
 */
async function changePassword(model: PasswordChangeRequestTO): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/change-password`, {
		body: model,
		method: RequestMethod.PATCH
	});
}

/**
 * Updates the data of the authenticated user
 * @param model user data model
 * @returns {Promise<ResponseBody<KollappUserTO>>} response body
 */
async function update(model: KollappUserUpdateRequestTO): Promise<ResponseBody<KollappUserTO>> {
	return customFetch(`${ENDPOINT}/update-information`, {
		body: model,
		method: RequestMethod.PATCH
	});
}

/**
 * Deletes the account of the authenticated user
 * @returns {Promise<ResponseBody>} response body
 */
async function remove(): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/delete`, {
		method: RequestMethod.DELETE
	});
}

export const userResource = {
	changePassword,
	get,
	remove,
	update
};
