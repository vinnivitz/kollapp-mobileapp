import type { PageLoad } from './$types';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';

import { PageRoute } from '$lib/models/routing';

export const load: PageLoad = async () => {
	if (!dev) {
		goto(PageRoute.HOME);
	}
};
