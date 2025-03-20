<script lang="ts">
	import '../app.css';
	import 'ionic-svelte/components/all';

	import type { TabConfig } from '$lib/models/ui';

	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { loadingController, setupIonicBase } from 'ionic-svelte';
	import { accessibility, home, person } from 'ionicons/icons';
	import { onDestroy, onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { initialized, t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { authenticationStore, localeStore, organizationStore, userStore } from '$lib/stores';

	let { children } = $props();

	let loadingSpinner: HTMLIonLoadingElement | undefined;
	let loadingTimeout: ReturnType<typeof setTimeout>;
	let tabs = $state<TabConfig[] | undefined>();
	let loaded = $state(false);

	setupIonicBase();

	$effect(() => {
		if (loaded && $authenticationStore) {
			initStores();
		}
	});

	$effect(() => {
		if (loaded && initialized) {
			tabs = [
				{ icon: home, label: $t('common.page-routes.home'), tab: PageRoute.HOME },
				{
					icon: accessibility,
					label: $t('common.page-routes.organization'),
					tab: PageRoute.ORGANIZATION.ROOT
				},
				{ icon: person, label: $t('common.page-routes.account'), tab: PageRoute.ACCOUNT.ROOT }
			];
		}
	});

	function initStores(): void {
		userStore.init();
		organizationStore.init();
	}

	onMount(async () => {
		loadingTimeout = setTimeout(async () => {
			if (!loaded) {
				loadingSpinner = await loadingController.create({});
				await loadingSpinner.present();
			}
		}, 100);
		await Promise.all([defineCustomElements(globalThis as unknown as Window), localeStore.init()]);
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
		{#if $authenticationStore && tabs}
			<Tabs {tabs}>
				{@render children?.()}
			</Tabs>
		{:else}
			{@render children?.()}
		{/if}
	{/if}
</ion-app>
