import type { MaintenanceInfoDto } from '$lib/api/dto/server';
import type { ReleaseNotesModel } from '$lib/models/models';

import { TZDate } from '@date-fns/tz';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch, showAlert } from '$lib/utility';

const ENDPOINT = '';

/**
 * Fetches the API version from the server.
 * @returns {Promise<ResponseBody<string>>} The API version as a response body.
 */
async function getApiVersion(): Promise<ResponseBody<string>> {
	return customFetch(`${ENDPOINT}/public/version`);
}

/**
 * Reports an error log to the server.
 * @param log The error log to report
 * @returns {Promise<ResponseBody>} The response body from the server
 */
async function reportErrorLog(log: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/report-error`, {
		authorizationType: AuthorizationType.NONE,
		body: { log, timestamp: new TZDate().toISOString() },
		method: RequestMethod.POST,
		silentOnError: true,
		silentOnSuccess: true
	});
}

/**
 * Fetches the maintenance information from the server.
 * @returns {Promise<ResponseBody<MaintenanceInfoDto>>} The maintenance information from the server.
 */
async function getMaintenanceInfo(): Promise<ResponseBody<MaintenanceInfoDto>> {
	return customFetch(`${ENDPOINT}/maintenance-info`, {
		authorizationType: AuthorizationType.NONE,
		method: RequestMethod.GET
	});
}

/**
 * Fetches the release notes from the server.
 * @returns {Promise<ReleaseNotesModel[]>} The release notes from the server.
 */
async function getReleaseNotes(): Promise<ReleaseNotesModel[]> {
	try {
		const response = await fetch('/data/release-notes.json');

		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			throw new Error('Failed to fetch release notes');
		}
	} catch {
		showAlert('Failed to fetch release notes');
		return [];
	}
}

export const metaResource = {
	getApiVersion,
	getMaintenanceInfo,
	getReleaseNotes,
	reportErrorLog
};
