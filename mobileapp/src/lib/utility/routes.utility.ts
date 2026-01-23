import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import type { RouteId } from '$app/types';

import { modalStore } from '$lib/stores';

/**
 * Navigates back in the browser history if history is present otherwise one hirarchy up.
 */
export async function navigateBack(): Promise<void> {
	const hasModal = modalStore.closeLastIfExists();
	if (hasModal) return;

	if (!browser) {
		return goto(resolve('/'));
	}

	if (history.length > 1) {
		return history.back();
	}

	const currentPathname = page.url.pathname;

	const segments = currentPathname.split('/').filter(Boolean);
	if (segments.length > 0) {
		segments.pop();
	}

	const parentPath = (segments.length > 0 ? `/${segments.join('/')}` : '/') as RouteId;

	if (parentPath === '/' && currentPathname === '/') {
		return;
	}

	// eslint-disable-next-line svelte/no-navigation-without-resolve
	await goto(parentPath, { replaceState: true });
}
