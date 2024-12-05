import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { get } from 'svelte/store';

import { goto } from '$app/navigation';

import type { LayoutLoad } from './$types';

import { loadTranslations, locale, t } from '$lib/locales';
import { AlertType } from '$lib/models';
import { userStore } from '$lib/store';
import { determineLocale, navigateBack, showAlert } from '$lib/utils';

const $t = get(t);

export const ssr = false;

export const load: LayoutLoad = async () => {
	try {
		await loadTranslations(await determineLocale());
		locale.set(await determineLocale());
		await handleAppEvents();
		await userStore.init();
	} catch (error) {
		let message = $t('api.error');
		if (error instanceof Error) {
			message = error.message;
		}
		showAlert({ type: AlertType.ERROR, message });
	}
};

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
