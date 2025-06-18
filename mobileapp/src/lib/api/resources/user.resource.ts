import type { ChangePasswordDto, UpdateUserDataDto } from '$lib/api/dto/client/user';
import type { UserDto } from '$lib/api/dto/server';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'user';

/**
 * Gets the data of authenticated user
 * @returns {Promise<ResponseBody>} response body
 */
export async function getByAuthentication(): Promise<ResponseBody<UserDto>> {
	return customFetch(ENDPOINT, { silentOnSuccess: true });
}

/**
 * Changes the password of the authenticated user
 * @param model change password model
 * @returns {Promise<ResponseBody>} response body
 */
export async function changePassword(model: ChangePasswordDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/change-password`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Updates the data of the authenticated user
 * @param model user data model
 * @returns {Promise<ResponseBody>} response body
 */
export async function update(model: UpdateUserDataDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/update-information`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Deletes the account of the authenticated user
 * @returns {Promise<ResponseBody>} response body
 */
export async function deleteAccount(): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/delete`, {
		method: RequestMethod.DELETE
	});
}
