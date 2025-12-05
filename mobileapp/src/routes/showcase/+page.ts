import type { PageLoad } from './$types';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export const load: PageLoad = async () => {
	if (!dev) {
		goto(resolve('/'));
	}
};
