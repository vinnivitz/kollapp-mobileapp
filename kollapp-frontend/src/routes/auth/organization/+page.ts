import { get } from 'svelte/store';

import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { PageRoute } from '$lib/models/routing';
import { organizationStore } from '$lib/store';

export const load: PageLoad = async () => {
	if (!get(organizationStore)) {
		await goto(PageRoute.HOME);
	}
};
