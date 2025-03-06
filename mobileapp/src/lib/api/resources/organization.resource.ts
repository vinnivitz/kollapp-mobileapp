import type {
	CreateActivityDto,
	RegisterOrganizationDto,
	UpdateActivityDto,
	UpdateOrganizationDto
} from '$lib/api/dto/client/organization';
import type { OrganizationDto } from '$lib/api/dto/server';
import type { ActivityDto } from '$lib/api/dto/server';
import { RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'organization';

/**
 * Retrieves the organization information.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization information.
 */
export async function getOrganization(): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}`, { silentOnSuccess: true, silentOnError: true });
}

/**
 * Creates a new organization.
 * @param model The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function createOrganization(model: RegisterOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model)
	});
}

/**
 * Updates the organization information.
 * @param model	The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function updateOrganization(model: UpdateOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.PUT,
		body: JSON.stringify(model)
	});
}

/**
 * Deletes user from the organization.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function leaveOrganization(): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Removes user from the organization.
 * @param userId The user id.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function removeUserFromOrganization(userId: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/person/${userId}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Retrieves the organization activities.
 * @param organizationId The organization id.
 * @returns {Promise<ResponseBody<ActivityDto[]>>} The organization activities.
 */
export async function getActivities(organizationId: string): Promise<ResponseBody<ActivityDto[]>> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity`, { silentOnSuccess: true });
}

/**
 * Creates a new activity for the given organization.
 * @param organizationId id of the organization
 * @param model activity model
 * @returns {Promise<ResponseBody>} response body
 */
export async function createActivity(
	organizationId: string,
	model: CreateActivityDto
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/${organizationId}/activity`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model)
	});
}

/**
 * Updates the activity of the given organization.
 * @param organizationId id of the organization
 * @param model activity model
 * @returns {Promise<ResponseBody>} response body
 */
export async function updateActivity(
	organizationId: string,
	activityId: string,
	model: UpdateActivityDto
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		method: RequestMethod.PUT,
		body: JSON.stringify(model)
	});
}

/**
 * Deletes the activity of the given organization.
 * @param organizationId id of the organization
 * @param activityId id of the activity
 * @returns {Promise<ResponseBody>} response body
 */
export async function deleteActivity(
	organizationId: string,
	activityId: string
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		method: RequestMethod.DELETE
	});
}
