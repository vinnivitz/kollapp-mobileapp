import { App, type URLOpenListenerEvent } from '@capacitor/app';

import { goto } from '$app/navigation';

import type { LayoutLoad } from './$types';

import { authenticationStore, connectionStore, themeStore } from '$lib/store';
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

		originalConsoleError.apply(console, arguments_);
	};
})();
