<script lang="ts">
	import '../app.css';
	import 'ionic-svelte/components/all';
	import 'leaflet/dist/leaflet.css';

	import type { TabConfig } from '$lib/models/ui';

	import { SplashScreen } from '@capacitor/splash-screen';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { setupIonicBase } from 'ionic-svelte';
	import { accessibility, home, person } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { initialized, t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import {
		authenticationStore,
		budgetPostingsStore,
		layoutStore,
		localeStore,
		organizationStore,
		userStore
	} from '$lib/stores';

	let { children } = $props();

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

	async function initStores(): Promise<void> {
		await userStore.init();
		organizationStore.init();
		budgetPostingsStore.init();
	}

	onMount(async () => {
		await Promise.all([defineCustomElements(globalThis as unknown as Window), localeStore.init()]);
		loaded = true;
		await SplashScreen.hide();
	});
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

{#key $layoutStore}
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
{/key}
