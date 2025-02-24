import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { PageRoute } from '$lib/models/routing';
import { organizationStore } from '$lib/store';

export const load: PageLoad = async () => {
	if (await organizationStore.exists()) {
		await goto(PageRoute.HOME);
	}
};
