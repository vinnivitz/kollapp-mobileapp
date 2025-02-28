import { App, type URLOpenListenerEvent } from '@capacitor/app';

import { goto } from '$app/navigation';

import type { LayoutLoad } from './$types';

import { authenticationStore, connectionStore, layoutStore, themeStore } from '$lib/store';
import { navigateBack } from '$lib/utils';
import { isAuthenticated } from '$lib/api/utils';
import { PageRoute } from '$lib/models/routing';

let initialized = false;

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
	const { pathname } = url;

	const authenticated = await isAuthenticated();

	if (authenticated && pathname.startsWith('/auth')) {
		goto(PageRoute.HOME);
	} else if (!authenticated && !pathname.startsWith('/auth')) {
		goto(PageRoute.AUTH.LOGIN);
	}

	if (!initialized) {
		initialized = true;
		handleAppEvents();
		initStores();
	}
};

async function initStores(): Promise<void> {
	themeStore.init();
	layoutStore.init();
	connectionStore.init();
	await authenticationStore.init();
}

async function handleAppEvents(): Promise<void> {
	App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
		const url = event.url;
		if (url.startsWith('kollapp://')) {
			const path = url.replace('kollapp:/', '');
			await goto(path);
		}
	});
	App.addListener('backButton', async () => await navigateBack());
}

// Workaround to suppress false positive error message from ion-tab
(function () {
	const originalConsoleError = console.error;

	console.error = function (...arguments_) {
		if (arguments_.length === 1 && arguments_[0] === 'tab with id: "undefined" does not exist') {
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
