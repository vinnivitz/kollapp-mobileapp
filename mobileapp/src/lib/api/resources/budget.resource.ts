import type { CreatePostingDto, UpdatePostingDto } from '$lib/api/dto/client/budget';
import type { ActivityPostingDto } from '../dto/server/budget/activity-posting.dto';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = (organizationId: number): string => `organization/${organizationId}`;

/**
 * Adds a new account posting to the specified account.
 * @param accountId The ID of the account to which the account posting will be added, if 0 its added as organization posting.
 * @param model The data for the new account posting.
 * @returns {Promise<ResponseBody<ActivityPostingDto>>} The response containing the created account posting.
 */
async function add(accountId: number, model: CreatePostingDto): Promise<ResponseBody<ActivityPostingDto>> {
	return customFetch(`${ENDPOINT}/${accountId}/posting`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Updates an existing activity posting by its ID.
 * @param organizationId The ID of the organization the posting belongs to
 * @param activityId The ID of the activity the posting belongs to
 * @param postingId The ID of the posting to update.
 * @param model The updated data for the activity posting.
 * @returns {Promise<ResponseBody<ActivityPostingDto>>} The response containing the updated account posting.
 */
async function updateActivityPosting(
	organizationId: number,
	activityId: number,
	postingId: number,
	model: UpdatePostingDto
): Promise<ResponseBody<ActivityPostingDto>> {
	return customFetch(`${ENDPOINT(organizationId)}/${activityId}/posting/${postingId}`, {
		body: JSON.stringify(model),
		method: RequestMethod.PUT
	});
}

/**
 * Updates an existing organization posting by its ID.
 * @param organizationId The ID of the organization the posting belongs to
 * @param postingId The ID of the posting to update.
 * @param model The updated data for the account posting.
 * @returns {Promise<ResponseBody<ActivityPostingDto>>} The response containing the updated account posting.
 */
async function updateOrganizationPosting(
	organizationId: number,
	postingId: number,
	model: UpdatePostingDto
): Promise<ResponseBody<ActivityPostingDto>> {
	return customFetch(`${ENDPOINT(organizationId)}/posting/${postingId}`, {
		body: JSON.stringify(model),
		method: RequestMethod.PUT
	});
}

/**
 * Deletes an organization posting by its ID.
 * @param organizationId The ID of the organization the posting belongs to
 * @param postingId The ID of the posting to delete.
 * @returns {Promise<ResponseBody>} The response indicating the result of the deletion.
 */
async function removeOrganizationPosting(organizationId: number, postingId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT(organizationId)}/${organizationId}/posting/${postingId}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Deletes an activity posting by its ID.
 * @param organizationId The ID of the organization the activity belongs to
 * @param activityId The ID of the activity the posting belongs to
 * @param postingId The ID of the posting to delete.
 * @returns {Promise<ResponseBody>} The response indicating the result of the deletion.
 */
async function removeActivityPosting(
	organizationId: number,
	activityId: number,
	postingId: number
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT(organizationId)}/${activityId}/posting/${postingId}`, {
		method: RequestMethod.DELETE
	});
}

export const budgetResource = {
	add,
	removeActivityPosting,
	removeOrganizationPosting,
	updateActivityPosting,
	updateOrganizationPosting
};
