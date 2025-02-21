import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { PageRoute } from '$lib/models/routing';

export const load: PageLoad = async ({ url }) => {
	const token = url.searchParams.get('resetPasswordToken');
	if (token) {
		return { token };
	} else {
		await goto(PageRoute.HOME);
	}
};
