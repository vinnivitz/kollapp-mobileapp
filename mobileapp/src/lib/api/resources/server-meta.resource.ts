import type { MaintenanceInfoDto } from '$lib/api/dto/server';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'server-meta';

/**
 * Fetches the API version from the server.
 * @returns {Promise<ResponseBody<string>>} The API version as a response body.
 */
export async function getApiVersion(): Promise<ResponseBody<string>> {
	return customFetch(`${ENDPOINT}/api-version`);
}

/**
 * Reports an error log to the server.
 * @param log The error log to report
 * @returns {Promise<ResponseBody>} The response body from the server
 */
export async function reportErrorLog(log: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/report-error`, {
		authorizationType: AuthorizationType.NONE,
		body: JSON.stringify({ log, timestamp: new Date().toISOString() }),
		method: RequestMethod.POST,
		silentOnError: true,
		silentOnSuccess: true
	});
}

/**
 * Fetches the maintenance information from the server.
 * @returns {Promise<ResponseBody<MaintenanceInfoDto>>} The maintenance information from the server.
 */
export async function getMaintenanceInfo(): Promise<ResponseBody<MaintenanceInfoDto>> {
	return customFetch(`${ENDPOINT}/maintenance-info`, {
		authorizationType: AuthorizationType.NONE,
		method: RequestMethod.GET
	});
}
