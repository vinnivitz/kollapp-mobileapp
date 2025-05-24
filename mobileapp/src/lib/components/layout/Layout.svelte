<script lang="ts">
	import { accessibilityOutline, diamondOutline, personOutline } from 'ionicons/icons';
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	import { dev } from '$app/environment';

	import Header from '$lib/components/layout/Header.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { initializationStore, organizationStore, userStore } from '$lib/stores';

	type Properties = {
		title: string;
		children?: Snippet;
		hideLayout?: boolean;
		hideMenu?: boolean;
		scrollable?: boolean;
		showBackButton?: boolean;
		onRefresh?: () => Promise<void>;
	};

	let {
		children,
		hideLayout = false,
		hideMenu = false,
		onRefresh,
		scrollable = true,
		showBackButton = false,
		title
	}: Properties = $props();

	const loading = $derived(!$initializationStore);

	let refresher = $state<HTMLIonRefresherElement | undefined>();
	let menuComponent = $state<ReturnType<typeof Menu>>();

	async function navigate(route: string): Promise<void> {
		menuComponent?.navigate(route);
	}

	async function doRefresh(): Promise<void> {
		await (onRefresh ? onRefresh() : Promise.all([userStore.init(), organizationStore.init()]));
		refresher?.complete();
	}
</script>

{#if !hideLayout && !hideMenu}
	<Menu bind:this={menuComponent}>
		<ion-list>
			<LabeledItem
				transparent
				click={() => navigate(PageRoute.ACCOUNT.ROOT)}
				icon={personOutline}
				label={$t('components.layout.header.button.account')}
			/>
			<LabeledItem
				transparent
				click={() => navigate(PageRoute.ORGANIZATION.ROOT)}
				icon={accessibilityOutline}
				label={$t('components.layout.menu.list.organization')}
			/>
			{#if dev}
				<LabeledItem transparent icon={diamondOutline} click={() => navigate('/showcase')} label="Showcase" />
			{/if}
		</ion-list>
	</Menu>
{/if}

<div class="ion-page" id="menu">
	{#if !hideLayout}
		<Header {title} {showBackButton}></Header>
	{/if}
	{#if !loading}
		<ion-content class="ion-padding" in:fade={{ delay: 0, duration: 200 }} class:no-overflow={!scrollable}>
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-refresher bind:this={refresher} slot="fixed" on:ionRefresh={doRefresh}>
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
			{@render children?.()}
		</ion-content>
	{/if}
</div>

<style>
	ion-content.no-overflow {
		--overflow: hidden;
	}
</style>
