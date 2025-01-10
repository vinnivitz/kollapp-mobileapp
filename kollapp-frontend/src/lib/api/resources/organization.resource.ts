import type { ChangePasswordDto } from '../dto';

import { RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';
import type { OrganizationModel } from '$lib/models';

const ENDPOINT = 'organization';

/**
 * Gets the organization data
 * @returns {Promise<ResponseBody>}
 */
export async function getOrganization(): Promise<ResponseBody<OrganizationModel>> {
	return customFetch(ENDPOINT, { silentOnSuccess: true, silentOnError: true });
}

export async function changePassword(model: ChangePasswordDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}/change-password`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model)
	});
}
