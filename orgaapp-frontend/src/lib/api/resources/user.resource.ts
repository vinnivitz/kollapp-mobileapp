import { type ApiResponse, type UserModel } from '$lib/api/models';
import { customFetch, getUrl, getApiResponse, getResponseError } from '$lib/api/utils';

const ENDPOINT = 'user';

/**
 * Get user data when authorized
 * @returns {Promise<ApiResponse<UserModel>>}
 */
export async function get(silent?: boolean): Promise<ApiResponse<UserModel>> {
	try {
		const response = await customFetch(getUrl(ENDPOINT));
		return getApiResponse<UserModel>(response, silent);
	} catch (error) {
		return getResponseError<UserModel>(error, silent);
	}
}
