import type { UserDto } from '../dto';

import { type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';

const ENDPOINT = 'user';

/**
 * Get user data when authorized
 * @returns {Promise<ResponseBody<UserDto>>}
 */
export async function get(silent = false): Promise<ResponseBody<UserDto>> {
	return customFetch({
		url: getUrl(`${ENDPOINT}`),
		silent
	});
}
