<script lang="ts">
	import { accessibilityOutline, diamondOutline, personOutline } from 'ionicons/icons';
	import { onDestroy, type Snippet } from 'svelte';
	import { derived } from 'svelte/store';
	import { fade } from 'svelte/transition';

	import { dev } from '$app/environment';

	import Header from '$lib/components/layout/Header.svelte';
	import Menu from '$lib/components/layout/Menu.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { activitiesStore, organizationStore, userStore } from '$lib/stores';

	type Properties = {
		title: string;
		children?: Snippet;
		hideLayout?: boolean;
		hideMenu?: boolean;
		scrollable?: boolean;
		showBackButton?: boolean;
		onRefresh?: (refresher: HTMLIonRefresherElement) => void;
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

	let navigationDebounced = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout>;
	let refresher = $state<HTMLIonRefresherElement | undefined>();
	let menuComponent = $state<ReturnType<typeof Menu>>();

	const loading = !derived(
		[userStore.initialized, organizationStore.initialized, activitiesStore.initialized],
		([$userInitialized, $organizationInitialized, $activitiesInitialized]) =>
			$userInitialized && $organizationInitialized && $activitiesInitialized
	);

	$effect(() => {
		if (loading) {
			navigationDebounced = false;
			navigationTimeout = setTimeout(() => (navigationDebounced = true), 100);
		}
	});

	onDestroy(() => {
		if (navigationTimeout) {
			clearTimeout(navigationTimeout);
		}
	});

	async function navigate(route: string): Promise<void> {
		menuComponent?.navigate(route);
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
				<LabeledItem transparent icon={diamondOutline} click={() => navigate('showcase')} label="Showcase" />
			{/if}
		</ion-list>
	</Menu>
{/if}

<div class="ion-page" id="menu">
	{#if !hideLayout}
		<Header {title} {showBackButton}></Header>
	{/if}
	{#if loading && navigationDebounced}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
	<ion-content class="ion-padding" in:fade={{ delay: 0, duration: 200 }} class:no-overflow={!scrollable}>
		{#if onRefresh}
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-refresher bind:this={refresher} slot="fixed" on:ionRefresh={() => refresher && onRefresh?.(refresher)}>
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
		{/if}
		{@render children?.()}
	</ion-content>
</div>

<style>
	ion-content.no-overflow {
		--overflow: hidden;
	}
</style>
