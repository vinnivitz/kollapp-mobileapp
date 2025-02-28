import type { RegisterOrganizationDto, UpdateOrganizationDto } from '$lib/api/dto/client';
import type { OrganizationDto } from '$lib/api/dto/server';
import { RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'organization';

/**
 * Retrieves the organization information.
 * @returns {Promise<ResponseBody<OrganizationDto>>} The organization information.
 */
export function getOrganization(): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}`, { silentOnError: true });
}

/**
 * Creates a new organization.
 * @param model The organization information.
 * @returns {Promise<ResponseBody>} The response body.
 */
export function createOrganization(model: RegisterOrganizationDto): Promise<ResponseBody> {
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
export function updateOrganization(model: UpdateOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.PUT,
		body: JSON.stringify(model),
		silentOnSuccess: false
	});
}

/**
 * Deletes the organization.
 * @returns {Promise<ResponseBody>} The response body.
 */
export function deleteOrganization(): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.DELETE,
		silentOnSuccess: false
	});
}
