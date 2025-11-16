import type { ActivityCreationRequestTO, ActivityUpdateRequestTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class ActivityResource {
	ENDPOINT = 'organization';

	/**
	 * Creates a new activity for the given organization.
	 * @param organizationId id of the organization
	 * @param model activity model
	 * @returns {Promise<ResponseBody>} response body
	 */
	async create(organizationId: number, model: ActivityCreationRequestTO): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/activity`, {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Updates the activity of the given organization.
	 * @param organizationId id of the organization
	 * @param activityId id of the activity
	 * @param model activity model
	 * @returns {Promise<ResponseBody>} response body
	 */
	async update(organizationId: number, activityId: number, model: ActivityUpdateRequestTO): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/activity/${activityId}`, {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Deletes the activity of the given organization.
	 * @param organizationId id of the organization
	 * @param activityId id of the activity
	 * @returns {Promise<ResponseBody>} response body
	 */
	async remove(organizationId: number, activityId: number): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/activity/${activityId}`, {
			method: RequestMethod.DELETE
		});
	}
}

export const activityResource = new ActivityResource();
