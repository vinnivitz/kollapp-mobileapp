<script lang="ts">
	import '../app.css';
	import '$lib/ionic/components/all';
	import 'leaflet/dist/leaflet.css';
	import '@ionic/core/css/core.css';
	import '@ionic/core/css/normalize.css';
	import '@ionic/core/css/structure.css';
	import '@ionic/core/css/typography.css';
	import '@ionic/core/css/padding.css';
	import '@ionic/core/css/float-elements.css';
	import '@ionic/core/css/text-alignment.css';
	import '@ionic/core/css/text-transformation.css';
	import '@ionic/core/css/flex-utils.css';
	import '@ionic/core/css/display.css';

	import type { TabConfig } from '$lib/models/ui';

	import { SplashScreen } from '@capacitor/splash-screen';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { accessibility, home, person } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import GlobalPopovers from '$lib/components/widgets/ionic/GlobalPopovers.svelte';
	import { initializeIonic } from '$lib/ionic';
	import { initialized, t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { AppStateType } from '$lib/models/ui';
	import { appStateStore, authenticationStore, layoutStore } from '$lib/stores';

	let { children } = $props();

	let tabs = $state<TabConfig[]>();

	initializeIonic();

	$effect(() => {
		if (initialized) {
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

	$effect(() => {
		const state = $appStateStore;
		if (state === AppStateType.READY || state === AppStateType.ERROR) {
			SplashScreen.hide();
		}
	});

	onMount(async () => {
		await defineCustomElements(globalThis as unknown as Window);
	});
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

{#key $layoutStore}
	<ion-app>
		{#if $appStateStore === AppStateType.READY}
			{#if $authenticationStore && tabs}
				<Tabs {tabs}>
					{@render children?.()}
				</Tabs>
			{:else}
				{@render children?.()}
			{/if}
			<GlobalPopovers />
		{:else if $appStateStore === AppStateType.ERROR}
			<div class="flex h-full items-center justify-center p-4">
				<div class="text-center">
					<h2 class="mb-2 text-xl font-bold">Initialization Error</h2>
					<p class="text-gray-600">An error occurred while starting the app.</p>
				</div>
			</div>
		{/if}
	</ion-app>
{/key}
