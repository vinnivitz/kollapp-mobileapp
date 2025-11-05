<script lang="ts">
	import { accessibilityOutline, diamondOutline, flashOutline, personOutline } from 'ionicons/icons';
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	import { dev } from '$app/environment';

	import Header from '$lib/components/layout/Header.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { initializationStore, organizationStore, userStore } from '$lib/stores';

	type Properties = {
		title: string;
		children?: Snippet;
		hideLayout?: boolean;
		hideMenu?: boolean;
		loading?: boolean;
		scrollable?: boolean;
		showBackButton?: boolean;
		onRefresh?: () => Promise<void>;
	};

	let {
		children,
		hideLayout,
		hideMenu,
		loading = false,
		onRefresh,
		scrollable = true,
		showBackButton,
		title
	}: Properties = $props();

	const loadedCache = $derived($initializationStore.loadedCache);
	const loadedServer = $derived($initializationStore.loadedServer);
	const loaded = $derived($loadedCache || $loadedServer);

	let refresher = $state<HTMLIonRefresherElement>();
	let menuComponent = $state<ReturnType<typeof Menu>>();

	async function doRefresh(): Promise<void> {
		await (onRefresh ? onRefresh() : Promise.all([userStore.init(), organizationStore.init()]));
		refresher?.complete?.();
	}
</script>

{#if !hideLayout && !hideMenu}
	<Menu bind:this={menuComponent}>
		<ion-list>
			<LabeledItem
				transparent
				clicked={() => menuComponent?.navigate(PageRoute.ACCOUNT.ROOT)}
				icon={personOutline}
				label={$t('components.layout.header.button.account')}
			/>
			<LabeledItem
				transparent
				clicked={() => menuComponent?.navigate(PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
				icon={flashOutline}
				label={$t('components.layout.header.button.activities')}
			/>
			<LabeledItem
				transparent
				clicked={() => menuComponent?.navigate(PageRoute.ORGANIZATION.ROOT)}
				icon={accessibilityOutline}
				label={$t('components.layout.menu.list.organization')}
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
	{#if !hideLayout}
		<Header {title} {showBackButton} {loading}></Header>
	{/if}
	{#if loaded && !loading}
		<ion-content class="ion-padding" in:fade={{ delay: 0, duration: 200 }} class:no-overflow={!scrollable}>
			<ion-refresher bind:this={refresher} slot="fixed" onionRefresh={doRefresh}>
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
