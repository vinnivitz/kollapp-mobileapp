<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { loadingController, setupIonicBase } from 'ionic-svelte';
	import { home, cash, person } from 'ionicons/icons';
	import { onDestroy, onMount } from 'svelte';

	import { goto } from '$app/navigation';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { TabConfig } from '$lib/models/ui';
	import { authenticationStore, localeStore, organizationStore, userStore } from '$lib/store';

	let { children } = $props();

	let loadingSpinner: HTMLIonLoadingElement | undefined;
	let loadingTimeout: ReturnType<typeof setTimeout>;
	let tabs = $state<TabConfig[] | undefined>();
	let loaded = $state(false);
	let isAuthenticated = $state(false);

	$effect(() => {
		if (loaded) {
			if ($authenticationStore) {
				userStore.init();
				organizationStore.init().then(() => {
					if (!$organizationStore) {
						goto(PageRoute.AUTH.REGISTER_ORGANIZATION);
					}
				});
				isAuthenticated = true;
			} else {
				isAuthenticated = false;
			}
		}
	});

	setupIonicBase();

	onMount(async () => {
		loadingTimeout = setTimeout(async () => {
			if (!loaded) {
				loadingSpinner = await loadingController.create({});
				await loadingSpinner.present();
			}
		}, 100);
		await Promise.all([defineCustomElements(globalThis as unknown as Window), localeStore.init()]);
		tabs = [
			{ label: $t('common.page-routes.home'), icon: home, tab: PageRoute.HOME },
			{
				label: $t('common.page-routes.finances'),
				icon: cash,
				tab: PageRoute.FINANCES
			},
			{ label: $t('common.page-routes.account'), icon: person, tab: PageRoute.ACCOUNT.ROOT }
		];
		loaded = true;
		if (loadingSpinner) {
			await loadingSpinner.dismiss();
		}
	});

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
	{#if loaded}
		{#if isAuthenticated && tabs}
			<Tabs {tabs}>
				{@render children?.()}
			</Tabs>
		{:else}
			{@render children?.()}
		{/if}
	{/if}
</ion-app>
