import { get } from 'svelte/store';

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

/**
 * Navigates back in the browser history if history is present otherwise one hirarchy up.
 */
export async function navigateBack(): Promise<void> {
	const path = getPath();
	if (path !== '/') {
		const currentPath = path;
		if (browser) {
			globalThis.history.back();
		}
		if (currentPath === getPath()) {
			const segments = path.split('/').filter(Boolean); // Split the path and remove any empty segments
			if (segments.length > 0) {
				segments.pop();
				const newPath = `/${segments.join('/')}`;
				await goto(newPath);
			}
		}
	}
}

/**
 * Gets the current path.
 * @returns {string} the current path
 */
function getPath(): string {
	return browser ? get(page).url.pathname : '/';
}
