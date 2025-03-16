import type {
	CreateActivityDto,
	RegisterOrganizationDto,
	UpdateActivityDto,
	UpdateOrganizationDto
} from '$lib/api/dto/client/organization';
import type { ActivityDto, OrganizationDto } from '$lib/api/dto/server';

import { RequestMethod, type ResponseBody } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'organization';

export async function getById(_id: string): Promise<ResponseBody<OrganizationDto>> {
	void _id;
	// workaround for the server response until the server is fixed
	return customFetch(`${ENDPOINT}`, { silentOnSuccess: true });
}

/**
 * Retrieves the organization information.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization information.
 */
export async function getIds(): Promise<ResponseBody<string[]>> {
	// workaround for the server response until the server is fixed
	const response = await customFetch<OrganizationDto>(`${ENDPOINT}`, {
		silentOnError: true,
		silentOnSuccess: true
	});
	if (response.data) {
		return { ...response, data: [response.data.id] } as ResponseBody<string[]>;
	}
	return response as unknown as ResponseBody<string[]>;
}

/**
 * Creates a new organization.
 * @param model The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function create(model: RegisterOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Updates the organization information.
 * @param model	The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function update(model: UpdateOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		body: JSON.stringify(model),
		method: RequestMethod.PUT
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
	return customFetch(`${ENDPOINT}/${organizationId}/activities`, { silentOnSuccess: true });
}

/**
 * Creates a new activity for the given organization.
 * @param organizationId id of the organization
 * @param model activity model
 * @returns {Promise<ResponseBody>} response body
 */
export async function createActivity(organizationId: string, model: CreateActivityDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity`, {
		body: JSON.stringify(model),
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
export async function updateActivity(
	organizationId: string,
	activityId: string,
	model: UpdateActivityDto
): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		body: JSON.stringify(model),
		method: RequestMethod.POST
	});
}

/**
 * Deletes the activity of the given organization.
 * @param organizationId id of the organization
 * @param activityId id of the activity
 * @returns {Promise<ResponseBody>} response body
 */
export async function deleteActivity(organizationId: string, activityId: string): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		method: RequestMethod.DELETE
	});
}
