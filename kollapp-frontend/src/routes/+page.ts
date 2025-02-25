import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { PageRoute } from '$lib/models/routing';
import { isAuthenticated } from '$lib/api/utils';

export const load: PageLoad = async () => {
	if (!(await isAuthenticated())) {
		await goto(PageRoute.AUTH.LOGIN);
	}
};
