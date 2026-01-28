<script lang="ts">
	import { accessibilityOutline, diamondOutline, flashOutline, personOutline } from 'ionicons/icons';
	import { onDestroy, type Snippet } from 'svelte';

	import { dev } from '$app/environment';
	import { navigating, page } from '$app/state';

	import FadeInOut from '../utility/FadeInOut.svelte';

	import Header from '$lib/components/layout/Header.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { initializationStore, organizationStore } from '$lib/stores';
	import { refreshDataStores } from '$lib/utility';

	type Properties = {
		children?: Snippet;
		hideMenu?: boolean;
		loading?: boolean;
		scrollable?: boolean;
		showBackButton?: boolean;
		title?: string;
		onRefresh?: () => Promise<void>;
	};

	let {
		children,
		hideMenu,
		loading = false,
		onRefresh,
		scrollable = true,
		showBackButton,
		title
	}: Properties = $props();

	let currentRoute = $state<string>(page.route.id ?? '');

	const loaded = $derived(initializationStore.loaded);

	const isNavigating = $derived(navigating.to && navigating.to?.route.id !== currentRoute);

	let refresher = $state<HTMLIonRefresherElement>();
	let menuComponent = $state<ReturnType<typeof Menu>>();

	let timer: ReturnType<typeof setTimeout>;
	let showSpinner = $state<boolean>(false);

	$effect(() => {
		clearTimeout(timer);

		if (loading || !$loaded || isNavigating) {
			showSpinner = false;
			timer = setTimeout(() => (showSpinner = true), 100);
		} else {
			showSpinner = false;
		}
	});

	onDestroy(() => clearTimeout(timer));

	async function doRefresh(): Promise<void> {
		await (onRefresh ? onRefresh() : refreshDataStores());
		await refresher?.complete?.();
	}
</script>

{#if title && !hideMenu && $loaded}
	<Menu bind:this={menuComponent}>
		<ion-list>
			<LabeledItem
				transparent
				clicked={() => menuComponent?.navigate('/account')}
				icon={personOutline}
				label={$t('components.layout.menu.list.account.label')}
			/>
			{#if $organizationStore}
				<LabeledItem
					transparent
					clicked={() => menuComponent?.navigate('/organization/activities')}
					icon={flashOutline}
					label={$t('components.layout.menu.list.activities.label')}
				/>
			{/if}
			<LabeledItem
				transparent
				clicked={() => menuComponent?.navigate('/organization')}
				icon={accessibilityOutline}
				label={$t('components.layout.menu.list.collective.label')}
			/>
			{#if dev}
				<LabeledItem
					transparent
					icon={diamondOutline}
					clicked={() => menuComponent?.navigate('/showcase')}
					label="Showcase"
				/>
			{/if}
		</ion-list>
	</Menu>
{/if}

<div class="ion-page" id="menu">
	{#if title}
		<Header {title} {showBackButton} {loading}></Header>
	{/if}
	<ion-content class="ion-padding" class:no-overflow={!scrollable}>
		{#if $loaded && !loading && !isNavigating}
			<ion-refresher bind:this={refresher} slot="fixed" onionRefresh={doRefresh}>
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
			<FadeInOut>
				{@render children?.()}
			</FadeInOut>
		{:else if showSpinner}
			<div class="flex h-full items-center justify-center">
				<ion-spinner name="crescent"></ion-spinner>
			</div>
		{/if}
	</ion-content>
</div>

<style>
	ion-content.no-overflow {
		--overflow: hidden;
	}
</style>
