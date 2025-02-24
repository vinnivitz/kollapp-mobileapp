import { App, type URLOpenListenerEvent } from '@capacitor/app';

import { goto } from '$app/navigation';

import type { LayoutLoad } from './$types';

import {
	authenticationStore,
	connectionStore,
	organizationStore,
	themeStore,
	userStore
} from '$lib/store';
import { navigateBack } from '$lib/utils';

export const ssr = false;

export const load: LayoutLoad = async () => {
	initStores();
	handleAppEvents();
};

function initStores(): void {
	themeStore.init();
	connectionStore.init();
	authenticationStore.init();
	userStore.init();
	organizationStore.init();
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
