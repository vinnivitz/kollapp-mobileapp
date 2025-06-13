import type {
	CreateActivityDto,
	RegisterOrganizationDto,
	UpdateActivityDto,
	UpdateOrganizationDto
} from '$lib/api/dto/client/organization';
import type { ActivityDto, OrganizationDto } from '$lib/api/dto/server';

import { RequestMethod, type ResponseBody, UserRole } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'organization';

/**
 * Retrieves the organization by id.
 * @param id The organization id.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization.
 */
export async function getById(id: number): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}/${id}`, { silentOnSuccess: true });
}

/**
 * Retrieves the organizations of the logged in user.
 * @returns {Promise<ResponseBody<OrganizationDto[]>>} The organizations.
 */
export async function getAll(): Promise<ResponseBody<OrganizationDto[]>> {
	return customFetch(`${ENDPOINT}`, { silentOnSuccess: true });
}

/**
 * Creates a new organization.
 * @param model The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function create(model: RegisterOrganizationDto): Promise<ResponseBody<OrganizationDto>> {
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
export async function update(id: number, model: UpdateOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${id}`, {
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
export async function removeUserFromOrganization(userId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/person/${userId}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Retrieves the organization activities.
 * @param organizationId The organization id.
 * @returns {Promise<ResponseBody<ActivityDto[]>>} The organization activities.
 */
export async function getActivities(organizationId: number): Promise<ResponseBody<ActivityDto[]>> {
	return customFetch(`${ENDPOINT}/${organizationId}/activities`, { silentOnSuccess: true });
}

/**
 * Creates a new activity for the given organization.
 * @param organizationId id of the organization
 * @param model activity model
 * @returns {Promise<ResponseBody>} response body
 */
export async function createActivity(organizationId: number, model: CreateActivityDto): Promise<ResponseBody> {
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
	organizationId: number,
	activityId: number,
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
export async function deleteActivity(organizationId: number, activityId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/activity/${activityId}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Grants a user a role in the organization.
 * @param userId The user id.
 * @param organizationId The organization id.
 * @param role The role to grant.
 * @returns {Promise<ResponseBody>} The response body.
 */
export async function grantUserRole(userId: number, organizationId: number, role: UserRole): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/person/${userId}/grant-role?role=${role}`, {
		method: RequestMethod.POST
	});
}

/**
 * Renews the invitation code for the organization.
 * @param organizationId The organization id.
 * @returns {Promise<ResponseBody<string>>} The new invitation code.
 */
export async function renewInvitationCode(organizationId: number): Promise<ResponseBody<string>> {
	return customFetch(`${ENDPOINT}/${organizationId}/invitation-code`, {
		method: RequestMethod.POST,
		silentOnSuccess: true
	});
}
