import type { ReleaseNotesTO } from '$lib/api/dtos';
import type { ApiVersionTO } from '@kollapp/api-types';

import { TZDate } from '@date-fns/tz';

import { AuthorizationType, RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch, showAlert } from '$lib/utility';

class MetaResource {
	ENDPOINT = '';

	/** Fetches the API version from the server.
	 * @return {Promise<ResponseBody<ApiVersionTO>>} The API version response body.
	 */
	async getApiVersion(): Promise<ResponseBody<ApiVersionTO>> {
		return customFetch(`${this.ENDPOINT}/public/version`);
	}

	/** Reports an error log to the server.
	 * @param log The error log.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async reportErrorLog(log: string): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/report-error`, {
			authorizationType: AuthorizationType.NONE,
			body: { log, timestamp: new TZDate().toISOString() },
			method: RequestMethod.POST,
			silentOnError: true,
			silentOnSuccess: true
		});
	}

	/** Fetches the maintenance information from the server.
	 * @returns {Promise<ResponseBody<{ scheduled: string }>>} The maintenance information.
	 */
	async getMaintenanceInfo(): Promise<ResponseBody<{ scheduled: string }>> {
		return customFetch(`${this.ENDPOINT}/maintenance-info`, {
			authorizationType: AuthorizationType.NONE,
			method: RequestMethod.GET
		});
	}

	/** Fetches the release notes from the server.
	 * @returns {Promise<ReleaseNotesTO[]>} The release notes.
	 */
	async getReleaseNotes(): Promise<ReleaseNotesTO[]> {
		try {
			const response = await fetch('/data/release-notes.json');

			if (response.ok) {
				const data = await response.json();
				return data;
			} else {
				throw new Error('Failed to fetch release notes');
			}
		} catch {
			await showAlert('Failed to fetch release notes');
			return [];
		}
	}
}

export const metaService = new MetaResource();
