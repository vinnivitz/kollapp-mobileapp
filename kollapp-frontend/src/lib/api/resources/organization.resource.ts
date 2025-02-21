import type { RegisterOrganizationDto } from '$lib/api/dto/client';
import type { OrganizationDto } from '$lib/api/dto/server';
import { RequestMethod, type ResponseBody } from '$lib/api/models';
import { customFetch } from '$lib/api/utils';

const ENDPOINT = 'organization';

export function getOrganization(): Promise<ResponseBody<OrganizationDto>> {
	return customFetch(`${ENDPOINT}`, { silentOnError: true });
}

export function createOrganization(model: RegisterOrganizationDto): Promise<ResponseBody> {
	return customFetch(`${ENDPOINT}`, {
		method: RequestMethod.POST,
		body: JSON.stringify(model)
	});
}
