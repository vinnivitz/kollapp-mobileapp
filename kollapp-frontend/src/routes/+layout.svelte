<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { loadingController, setupIonicBase } from 'ionic-svelte';
	import { home, cash, person } from 'ionicons/icons';
	import { onDestroy, onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { loadTranslations, locale, t } from '$lib/locales';
	import { PageRoute, type TabConfig } from '$lib/models';
	import { userStore } from '$lib/store';
	import { determineLocale } from '$lib/utils';

	let { children } = $props();

	let loadingTimeout: ReturnType<typeof setTimeout>;
	let tabs = $state<TabConfig[] | undefined>();
	let loaded = $state(false);

	setupIonicBase();

	onMount(async () => {
		let loadingSpinner: HTMLIonLoadingElement | undefined;
		loadingTimeout = setTimeout(async () => {
			if (!loaded) {
				loadingSpinner = await loadingController.create({});
				await loadingSpinner.present();
			}
		}, 100);
		await Promise.all([defineCustomElements(globalThis as unknown as Window), initTranslations()]);
		tabs = [
			{ label: $t('common.page-routes.home'), icon: home, tab: PageRoute.HOME },
			{
				label: $t('common.page-routes.finances'),
				icon: cash,
				tab: PageRoute.FINANCES
			},
			{ label: $t('common.page-routes.account'), icon: person, tab: PageRoute.ACCOUNT }
		];
		await userStore.init();
		loaded = true;
		if (loadingSpinner) {
			await loadingSpinner.dismiss();
		}
	});

	async function initTranslations(): Promise<void> {
		const currentLocale = await determineLocale();
		await loadTranslations(currentLocale);
		locale.set(currentLocale);
	}

	onDestroy(() => {
		if (loadingTimeout) {
			clearTimeout(loadingTimeout);
		}
	});
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

<ion-app>
	{#if tabs}
		<Tabs {tabs}>
			{#if loaded}
				{@render children?.()}
			{/if}
		</Tabs>
	{/if}
</ion-app>
