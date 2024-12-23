import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { isAuthenticated } from '$lib/api/utils';
import { PageRoute } from '$lib/models';

export const load: PageLoad = async () => {
	if (!(await isAuthenticated())) {
		await goto(PageRoute.HOME);
	}
};
