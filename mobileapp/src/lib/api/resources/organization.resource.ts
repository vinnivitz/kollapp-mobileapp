import type { RegisterOrganizationDto, UpdateOrganizationDto } from '$lib/api/dto/client/organization';
import type { OrganizationDto } from '$lib/api/dto/server';

import { RequestMethod, type ResponseBody, UserRole } from '$lib/models/api';
import { customFetch } from '$lib/utility';

const ENDPOINT = 'organization';

/**
 * Retrieves the organization by id.
 * @param id The organization id.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization.
 */
async function getById(id: number): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}/${id}`, { silentOnSuccess: true });
}

/**
 * Retrieves the organizations of the logged in user.
 * @returns {Promise<ResponseBody<OrganizationDto[]>>} The organizations.
 */
async function getAll(): Promise<ResponseBody<OrganizationDto[]>> {
	return customFetch(`${ENDPOINT}`, { silentOnSuccess: true });
}

/**
 * Creates a new organization.
 * @param model The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
async function create(model: RegisterOrganizationDto): Promise<ResponseBody<OrganizationDto>> {
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
async function update(id: number, model: UpdateOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${id}`, {
		body: JSON.stringify(model),
		method: RequestMethod.PUT
	});
}

/**
 * Deletes user from the organization.
 * @returns {Promise<ResponseBody>} The response body.
 */
async function leaveOrganization(organizationId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}`, {
		method: RequestMethod.DELETE
	});
}

/**
 * Removes user from the organization.
 * @param userId The user id.
 * @returns {Promise<ResponseBody>} The response body.
 */
async function removeUserFromOrganization(organizationId: number, userId: number): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/person/${userId}`, {
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
async function grantUserRole(userId: number, organizationId: number, role: UserRole): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/${organizationId}/person/${userId}/grant-role?role=${role}`, {
		method: RequestMethod.PATCH
	});
}

/**
 * Renews the invitation code for the organization.
 * @param organizationId The organization id.
 * @returns {Promise<ResponseBody<string>>} The new invitation code.
 */
async function renewInvitationCode(organizationId: number): Promise<ResponseBody<string>> {
	return customFetch(`${ENDPOINT}/${organizationId}/invitation-code`, {
		method: RequestMethod.PATCH
	});
}

/**
 * Retrieves the organization by invitation code.
 * @param code The invitation code.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization.
 */
async function getOrganizationByInvitationCode(code: string): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}/invitation/${code}`, { silentOnSuccess: true });
}

/**
 * Joins an organization by invitation code.
 * @param code The invitation code.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization.
 */
async function joinOrganizationByInvitationCode(code: string): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}/invitation/${code}`, {
		method: RequestMethod.POST
	});
}

export const organizationResource = {
	create,
	getAll,
	getById,
	getOrganizationByInvitationCode,
	grantUserRole,
	joinOrganizationByInvitationCode,
	leaveOrganization,
	removeUserFromOrganization,
	renewInvitationCode,
	update
};
