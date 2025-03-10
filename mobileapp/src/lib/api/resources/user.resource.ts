import type { ChangePasswordDto, UpdateUserDataDto } from '$lib/api/dto/client/user';
import type { UserDto } from '$lib/api/dto/server';
import { type ResponseBody, RequestMethod } from '$lib/models/api';
import { customFetch } from '$lib/utils';

const ENDPOINT = 'user';

/**
 * Gets the data of authenticated user
 * @returns {Promise<ResponseBody>} response body
 */
export async function getByAuthentication(): Promise<ResponseBody<UserDto>> {
	return customFetch(ENDPOINT, { silentOnError: true, silentOnSuccess: true });
}

/**
 * Changes the password of the authenticated user
 * @param model change password model
 * @returns {Promise<ResponseBody>} response body
 */
export async function changePassword(model: ChangePasswordDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/change-password`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model)
	});
}

/**
 * Updates the data of the authenticated user
 * @param model user data model
 * @returns {Promise<ResponseBody>} response body
 */
export async function update(model: UpdateUserDataDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/update-information`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model),
		silentOnSuccess: false
	});
}
