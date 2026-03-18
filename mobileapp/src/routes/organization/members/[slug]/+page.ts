import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	return { personOfOrganizationId: +params.slug };
};
