<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import { derived } from 'svelte/store';
	import { fade } from 'svelte/transition';

	import Header from './Header.svelte';
	import Menu from './Menu.svelte';

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
</script>

{#if !hideLayout && !hideMenu}
	<Menu></Menu>
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

<style lang="postcss">
	ion-content.no-overflow {
		--overflow: hidden;
	}
</style>
