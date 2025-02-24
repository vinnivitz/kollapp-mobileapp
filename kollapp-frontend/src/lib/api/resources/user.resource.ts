import type { ChangePasswordDto } from '$lib/api/dto/client';
import type { UserDto } from '$lib/api/dto/server';
import { RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'user';

/**
 * Gets the data of authenticated user
 * @returns {Promise<ResponseBody>} response body
 */
export async function getAuthenticatedUser(): Promise<ResponseBody<UserDto>> {
	return customFetch(ENDPOINT, { silentOnError: true });
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
