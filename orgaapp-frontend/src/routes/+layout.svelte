<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { setupIonicBase } from 'ionic-svelte';
	import { home, cash, person } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { t } from '$lib/locales';
	import { PageRoute, type TabConfig } from '$lib/models';
	import { themeStore } from '$lib/store';

	let { children } = $props();

	const tabs: TabConfig[] = [
		{ label: $t('common.page-routes.home'), icon: home, tab: PageRoute.HOME },
		{
			label: $t('common.page-routes.finances'),
			icon: cash,
			tab: PageRoute.FINANCES
		},
		{ label: $t('common.page-routes.account'), icon: person, tab: PageRoute.ACCOUNT }
	];

	setupIonicBase();

	onMount(async () => {
		await themeStore.init();
		await defineCustomElements(globalThis as unknown as Window);
	});
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

<ion-app>
	<Tabs {tabs}>
		{@render children?.()}
	</Tabs>
</ion-app>
