import type { ActivityCreationRequestTO, ActivityUpdateRequestTO } from '@kollapp/api-types';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'organization';

/**
 * Creates a new activity for the given organization.
 * @param organizationId id of the organization
 * @param model activity model
 * @returns {Promise<ResponseBody>} response body
 */
async function create(organizationId: number, model: ActivityCreationRequestTO): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity`, {
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
async function update(
	organizationId: number,
	activityId: number,
	model: ActivityUpdateRequestTO
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
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
async function remove(organizationId: number, activityId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		method: RequestMethod.DELETE
	});
}

export const activityResource = {
	create,
	remove,
	update
};
