import type { LayoutLoad } from './$types';

import { App, type URLOpenListenerEvent } from '@capacitor/app';

import { goto } from '$app/navigation';

import { PageRoute } from '$lib/models/routing';
import { authenticationStore, connectionStore, layoutStore, themeStore } from '$lib/stores';
import { isAuthenticated, navigateBack } from '$lib/utils';

let initialized = false;

export const ssr = false;

export const load: LayoutLoad = async ({ url }) => {
	handleRouting(url.pathname, await isAuthenticated());

	if (!initialized) {
		initialized = true;
		handleAppEvents();
		initStores();
	}
};

async function handleRouting(pathname: string, authenticated: boolean): Promise<void> {
	const isAuthPath = pathname.startsWith('/auth');

	if (authenticated && isAuthPath) {
		goto(PageRoute.HOME);
	} else if (!authenticated && !isAuthPath) {
		goto(PageRoute.AUTH.LOGIN);
	}
}

async function initStores(): Promise<void> {
	await Promise.all([themeStore.init(), layoutStore.init(), connectionStore.init(), authenticationStore.init()]);
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
