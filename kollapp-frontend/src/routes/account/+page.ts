import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const label = url.searchParams.get('label');
	return { label };
};
