<script lang="ts">
	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';

	import Header from './Header.svelte';
	import Menu from './Menu.svelte';

	let {
		title,
		children,
		showBackButton = false,
		onRefresh
	}: {
		title: string;
		children?: Snippet;
		showBackButton?: boolean;
		onRefresh?: (refresher: HTMLIonRefresherElement) => void;
	} = $props();

	let navigationDebounced = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout>;
	let refresher = $state<HTMLIonRefresherElement | undefined>();

	$effect(() => {
		if ($navigating) {
			navigationTimeout = setTimeout(() => (navigationDebounced = true), 100);
		}
	});

	$effect(() => {
		clearTimeout(navigationTimeout);
		navigationDebounced = false;
	});
</script>

<Menu></Menu>

<div class="ion-page" id="menu">
	<Header {title} {showBackButton}></Header>
	{#if $navigating && navigationDebounced}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
	<ion-content class="ion-padding">
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
