<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { defineCustomElements } from '@ionic/pwa-elements/loader';
	import { setupIonicBase } from 'ionic-svelte';
	import { home, cash, person } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import Tabs from '$lib/components/layout/Tabs.svelte';
	import { loadTranslations, locale, t } from '$lib/locales';
	import { PageRoute, type TabConfig } from '$lib/models';
	import { userStore } from '$lib/store';
	import { determineLocale } from '$lib/utils';

	let { children } = $props();

	let tabs = $state<TabConfig[] | undefined>();

	setupIonicBase();

	onMount(async () => {
		await Promise.all([
			initTranslations().then(() => {
				tabs = [
					{ label: $t('common.page-routes.home'), icon: home, tab: PageRoute.HOME },
					{
						label: $t('common.page-routes.finances'),
						icon: cash,
						tab: PageRoute.FINANCES
					},
					{ label: $t('common.page-routes.account'), icon: person, tab: PageRoute.ACCOUNT }
				];
				userStore.init();
			}),
			defineCustomElements(globalThis as unknown as Window)
		]);
	});

	async function initTranslations() {
		const currentLocale = await determineLocale();
		await loadTranslations(currentLocale);
		locale.set(currentLocale);
	}
</script>

<svelte:head>
	<title>Kollapp - Die Kollektiv App</title>
</svelte:head>

<ion-app>
	{#if tabs}
		<Tabs {tabs}>
			{@render children?.()}
		</Tabs>
	{/if}
</ion-app>
