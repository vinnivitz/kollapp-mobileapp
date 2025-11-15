import type { LayoutLoad } from './$types';

import { App, type URLOpenListenerEvent } from '@capacitor/app';

import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { RouteId } from '$app/types';

import { appStateStore } from '$lib/stores';
import { initPushNotifications, isAuthenticated, navigateBack } from '$lib/utility';

export const ssr = false;

let initialized = false;

export const load: LayoutLoad = async ({ url }) => {
	if (!initialized) {
		initialized = true;
		await appStateStore.initialize();
		handleAppEvents();
		initPushNotifications();
	}

	const authenticated = await isAuthenticated();
	await handleRouting(url.pathname, authenticated);
};

async function handleRouting(pathname: string, authenticated: boolean): Promise<void> {
	const isAuthPath = pathname.startsWith('/auth' satisfies RouteId);

	if (authenticated && isAuthPath) {
		return goto(resolve('/'));
	} else if (!authenticated && !isAuthPath) {
		return goto(resolve('/auth/login'));
	}
}

async function handleAppEvents(): Promise<void> {
	App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
		const url = event.url;
		if (url.startsWith('kollapp://')) {
			const path = url.replace('kollapp:/', '') as RouteId;
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(path);
		}
	});
	App.addListener('backButton', async () => await navigateBack());
}

// Workaround to suppress false positive error message from ion-tab
(function () {
	const originalConsoleError = console.error;

	console.error = function (...arguments_) {
		if (arguments_.length === 1 && `${arguments_[0]}`.includes('Tab with id: "undefined" does not exist')) {
			return;
		}

		if (arguments_[0] instanceof Error) {
			const error = arguments_[0];
			Error.captureStackTrace(error, console.error);
			originalConsoleError.apply(console, arguments_);
		} else {
			const error = new Error(typeof arguments_[0] === 'string' ? arguments_[0] : 'Unknown error');
			Error.captureStackTrace(error, console.error);
			originalConsoleError.call(console, error, ...arguments_.slice(1));
		}
	};
})();
