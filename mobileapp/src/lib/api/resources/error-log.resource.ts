import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'public/error-log';

/**
 * Reports an error log to the server.
 * @param log The error log to report
 * @returns {Promise<ResponseBody>} The response body from the server
 */
export async function reportErrorLog(log: string): Promise<ResponseBody> {
	return customFetch(ENDPOINT, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify({ log, timestamp: new Date().toISOString() }),
		method: RequestMethod.POST,
		silentOnError: true,
		silentOnSuccess: true
	});
}
