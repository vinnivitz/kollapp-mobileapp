import type {
	OrganizationCreationRequestTO,
	OrganizationMinifiedTO,
	OrganizationRole,
	OrganizationTO,
	OrganizationUpdateRequestTO
} from '@kollapp/api-types';

import { AuthorizationType, RequestMethod, type ResponseBody, StatusCode } from '$lib/models/api';
import { customFetch } from '$lib/utility';

class OrganizationResource {
	ENDPOINT = 'organization';

	/**
	 * Retrieves the organization by id.
	 * @param id The organization id.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization.
	 */
	async getById(id: number): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${id}`, {
			silentOnSpecificStatus: [StatusCode.FORBIDDEN],
			silentOnSuccess: true
		});
	}

	/**
	 * Retrieves the organizations of the logged in user.
	 * @returns {Promise<ResponseBody<OrganizationMinifiedTO[]>>} The organizations.
	 */
	async getAll(): Promise<ResponseBody<OrganizationMinifiedTO[]>> {
		return customFetch(this.ENDPOINT, { silentOnSuccess: true });
	}

	/**
	 * Creates a new organization.
	 * @param model The organization information.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	async create(model: OrganizationCreationRequestTO): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(this.ENDPOINT, {
			body: model,
			method: RequestMethod.POST
		});
	}

	/**
	 * Updates the organization information.
	 * @param model	The organization information.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	async update(id: number, model: OrganizationUpdateRequestTO): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${id}`, {
			body: model,
			method: RequestMethod.PUT
		});
	}

	/**
	 * Deletes user from the organization and delete if last user with manager role.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async leave(organizationId: number): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/${organizationId}`, {
			method: RequestMethod.DELETE
		});
	}

	/**
	 * Removes user from the organization.
	 * @param personOfOrganizationId The id of the person of organization.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	async removeUser(organizationId: number, personOfOrganizationId: number): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/person/${personOfOrganizationId}`, {
			method: RequestMethod.DELETE
		});
	}

	/**
	 * Grants a organization a role in the organization.
	 * @param personOfOrganizationId The id of the person of organization.
	 * @param organizationId The organization id.
	 * @param role The role to grant.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	async grantRole(
		organizationId: number,
		personOfOrganizationId: number,
		role: OrganizationRole
	): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/person/${personOfOrganizationId}/grant-role`, {
			body: { role },
			method: RequestMethod.PATCH
		});
	}

	/**
	 * Renews the invitation code for the organization.
	 * @param organizationId The organization id.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization.
	 */
	async renewInvitationCode(organizationId: number): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/invitation-code`, {
			method: RequestMethod.PATCH,
			silentOnSuccess: true
		});
	}

	/**
	 * Retrieves the organization by invitation code.
	 * @param code The invitation code.
	 * @returns {Promise<ResponseBody<OrganizationMinifiedTO>>} The organization.
	 */
	async getByInvitationCode(code: string): Promise<ResponseBody<OrganizationMinifiedTO>> {
		return customFetch(`${this.ENDPOINT}/invitation/${code}`, {
			authorizationType: AuthorizationType.NONE,
			silentOnError: true,
			silentOnSuccess: true
		});
	}

	/**
	 * Joins an organization by invitation code.
	 * @param code The invitation code.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	async joinByInvitationCode(code: string): Promise<ResponseBody> {
		return customFetch(`${this.ENDPOINT}/invitation/${code}`, {
			method: RequestMethod.POST,
			silentOnSuccess: true
		});
	}

	/**
	 * Approves a user to join the organization.
	 * @param organizationId The organization id.
	 * @param userId The user id.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	async approveUser(organizationId: number, userId: number): Promise<ResponseBody<OrganizationTO>> {
		return customFetch(`${this.ENDPOINT}/${organizationId}/person/${userId}/approve`, {
			method: RequestMethod.PATCH
		});
	}
}

export const organizationService = new OrganizationResource();
