import type { CodeTO } from '$lib/api/dtos';
import type {
	OrganizationCreationRequestTO,
	OrganizationMinifiedTO,
	OrganizationRole,
	OrganizationTO,
	OrganizationUpdateRequestTO
} from '@kollapp/api-types';

import { AuthorizationType, RequestMethod, type ResponseBody, StatusCode } from '$lib/models/api';
import { organizationStore } from '$lib/stores';
import { customFetch, getOrganizationId, StatusCheck } from '$lib/utility';

class OrganizationService {
	private get base(): string {
		return 'organization';
	}

	/**
	 * Retrieves the organization by id.
	 * @param id The organization id.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization.
	 */
	getById = async (id: number): Promise<ResponseBody<OrganizationTO>> => {
		return customFetch<OrganizationTO>(`${this.base}/${id}`, {
			silentOnStatus: [StatusCode.FORBIDDEN]
		});
	};

	/**
	 * Retrieves the organizations of the logged in user.
	 * @returns {Promise<ResponseBody<OrganizationMinifiedTO[]>>} The minified organizations.
	 */
	getAll = async (): Promise<ResponseBody<OrganizationMinifiedTO[]>> => {
		return customFetch<OrganizationMinifiedTO[]>(this.base);
	};

	/**
	 * Creates a new organization.
	 * @param model The organization information.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization.
	 */
	create = async (model: OrganizationCreationRequestTO): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(this.base, {
			body: model,
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.initialize(response.data.id);
		}
		return response;
	};

	/**
	 * Updates the organization information.
	 * @param model	The organization information.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization.
	 */
	update = async (id: number, model: OrganizationUpdateRequestTO): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(`${this.base}/${id}`, {
			body: model,
			method: RequestMethod.PUT
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	};

	/**
	 * Removes user from the organization and deletes organization if it was the last user with manager role.
	 * @returns {Promise<ResponseBody>} The response body.
	 */
	leave = async (): Promise<ResponseBody> => {
		const response = await customFetch(`${this.base}/${getOrganizationId()!}`, {
			method: RequestMethod.DELETE
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.initialize();
		}
		return response;
	};

	/**
	 * Removes person from the organization.
	 * @param personOfOrganizationId The id of the person of organization.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization without the removed person.
	 */
	removePersonOfOrganization = async (personOfOrganizationId: number): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(
			`${this.base}/${getOrganizationId()!}/person/${personOfOrganizationId}`,
			{
				method: RequestMethod.DELETE
			}
		);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	};

	/**
	 * Grants a organization a role in the organization.
	 * @param personOfOrganizationId The id of the person of organization.
	 * @param role The role to grant.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization with the updated person role.
	 */
	grantRole = async (personOfOrganizationId: number, role: OrganizationRole): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(
			`${this.base}/${getOrganizationId()!}/person/${personOfOrganizationId}/grant-role`,
			{
				body: { role },
				method: RequestMethod.PATCH
			}
		);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	};

	/**
	 * Renews the invitation code for the organization.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The organization with the new invitation code.
	 */
	renewInvitationCode = async (): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(`${this.base}/${getOrganizationId()!}/invitation-code`, {
			method: RequestMethod.PATCH
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.set(response.data);
		}
		return response;
	};

	/**
	 * Retrieves the organization by invitation code.
	 * @param code The invitation code.
	 * @returns {Promise<ResponseBody<OrganizationMinifiedTO>>} The minified organization.
	 */
	getByInvitationCode = async (code: string): Promise<ResponseBody<OrganizationMinifiedTO>> => {
		return customFetch<OrganizationMinifiedTO>(`${this.base}/invitation/${code}`, {
			authorizationType: AuthorizationType.NONE,
			silentOnError: true
		});
	};

	/**
	 * Joins an organization by invitation code.
	 * @param model The invitation code model.
	 * @returns {Promise<ResponseBody<OrganizationMinifiedTO>>} The minified organization.
	 */
	joinByInvitationCode = async (model: CodeTO): Promise<ResponseBody<OrganizationMinifiedTO>> => {
		const response = await customFetch<OrganizationMinifiedTO>(`${this.base}/invitation/${model.code}`, {
			method: RequestMethod.POST
		});
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.initialize();
		}
		return response;
	};

	/**
	 * Approves a user to join the organization.
	 * @param userId The user id.
	 * @returns {Promise<ResponseBody<OrganizationTO>>} The response body.
	 */
	approveUser = async (userId: number): Promise<ResponseBody<OrganizationTO>> => {
		const response = await customFetch<OrganizationTO>(
			`${this.base}/${getOrganizationId()!}/person/${userId}/approve`,
			{
				method: RequestMethod.PATCH
			}
		);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.initialize(response.data.id);
		}
		return response;
	};
}

export const organizationService = new OrganizationService();
