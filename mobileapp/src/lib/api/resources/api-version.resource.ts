import type { ResponseBody } from '$lib/models/api';

import { customFetch } from '$lib/utility';

const ENDPOINT = '/version';

/**
 * Fetches the API version from the server.
 * @returns {Promise<ResponseBody<string>>} The API version as a response body.
 */
export async function getApiVersion(): Promise<ResponseBody<string>> {
	return customFetch(`${ENDPOINT}`);
}
