import type { ChangePasswordDto } from '../dto';

import { RequestMethod, type OrganizationModel, type ResponseBody } from '$lib/api/models';
import { customFetch, getUrl } from '$lib/api/utils';

const ENDPOINT = 'organization';

/**
 * Gets the organization data
 * @returns {Promise<ResponseBody>}
 */
export async function getOrganization(silent = true): Promise<ResponseBody<OrganizationModel>> {
	return customFetch({ url: getUrl(`${ENDPOINT}`), silent });
}

export async function changePassword(
	model: ChangePasswordDto,
	silent = false
): Promise<ResponseBody> {
	return customFetch({
		url: getUrl(`${ENDPOINT}/change-password`),
		options: { method: RequestMethod.POST, body: JSON.stringify(model) },
		silent
	});
}
