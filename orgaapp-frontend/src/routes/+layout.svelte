<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { setupIonicBase } from 'ionic-svelte';
	import { home, cash, person } from 'ionicons/icons';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { t } from '$lib/locales';
	import { PageRoute, type TabConfig } from '$lib/models';

	let { children } = $props();

	setupIonicBase();

	export const tabs: TabConfig[] = [
		{ label: $t('common.page-routes.home'), icon: home, tab: PageRoute.HOME },
		{
			label: $t('common.page-routes.finances'),
			icon: cash,
			tab: PageRoute.FINANCES
		},
		{ label: $t('common.page-routes.account'), icon: person, tab: PageRoute.ACCOUNT }
	];
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

<ion-app>
	<Tabs {tabs}>
		{@render children()}
	</Tabs>
</ion-app>
