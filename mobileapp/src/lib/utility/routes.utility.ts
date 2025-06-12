import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';

import { PageRoute, type PageRoutePaths } from '$lib/models/routing';
import { modalStore } from '$lib/stores';

/**
 * Navigates back in the browser history if history is present otherwise one hirarchy up.
 */
export async function navigateBack(): Promise<void> {
	const hasModal = await modalStore.closeLastIfExists();
	if (hasModal) return;
	const path = getPath();
	if (path !== PageRoute.HOME) {
		const currentPath = path;
		if (browser) {
			globalThis.history.back();
		}
		if (currentPath === getPath()) {
			const segments = path.split('/').filter(Boolean); // Split the path and remove any empty segments
			if (segments.length > 0) {
				segments.pop();
				const newPath = `/${segments.join('/')}`;
				await goto(newPath === '/' ? PageRoute.HOME : newPath);
			}
		}
	}
}

/**
 * Gets the current path.
 * @returns {string} the current path
 */
function getPath(): string {
	return (browser && page?.route?.id) || PageRoute.HOME;
}

/**
 * Builds a specific route with optional parameters.
 * @param {string} route - The route to navigate to.
 * @param {Record<string, string | number>} [parameters] - Optional parameters to replace in the route.
 */
export function buildRoute(route: PageRoutePaths, parameters: Record<string, number | string>): string {
	// eslint-disable-next-line security/detect-object-injection
	return route.replaceAll(/:([a-zA-Z]+)/g, (_, key) => `${parameters[key]}`);
}
