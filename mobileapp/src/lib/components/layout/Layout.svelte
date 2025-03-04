<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	import { navigating } from '$app/stores';

	import Header from './Header.svelte';
	import Menu from './Menu.svelte';

	let {
		title,
		children,
		showBackButton = false,
		onRefresh,
		loading = false,
		hideLayout = false,
		hideMenu = false
	}: {
		title: string;
		children?: Snippet;
		showBackButton?: boolean;
		onRefresh?: (refresher: HTMLIonRefresherElement) => void;
		loading?: boolean;
		hideLayout?: boolean;
		hideMenu?: boolean;
	} = $props();

	let navigationDebounced = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout>;
	let refresher = $state<HTMLIonRefresherElement | undefined>();

	$effect(() => {
		if ($navigating || loading) {
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
	{#if ($navigating || loading) && navigationDebounced}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
	<ion-content class="ion-padding" in:fade={{ duration: 200, delay: 0 }}>
		{#if onRefresh}
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-refresher
				bind:this={refresher}
				slot="fixed"
				on:ionRefresh={() => refresher && onRefresh?.(refresher)}
			>
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
		{/if}
		{@render children?.()}
	</ion-content>
</div>
