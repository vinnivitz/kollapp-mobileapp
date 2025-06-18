<script lang="ts">
	import { onDestroy } from 'svelte';

	import { goto } from '$app/navigation';

	import { PageRoute } from '$lib/models/routing';
	import { initializationStore } from '$lib/stores';
	import { navigateBack } from '$lib/utility';

	type Properties = {
		title: string;
		showBackButton?: boolean;
	};

	let { showBackButton, title }: Properties = $props();

	const loading = $derived(!$initializationStore);
	let navigationDebounced = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout>;

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

	async function navigate(): Promise<void> {
		return showBackButton ? navigateBack() : goto(PageRoute.HOME);
	}
</script>

<ion-header>
	<ion-toolbar>
		<ion-title>{title}</ion-title>

		<ion-buttons slot="start">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<ion-button onclick={navigate}>
				{#if showBackButton}
					<ion-back-button default-href="/"> </ion-back-button>
				{:else}
					<img src="/logo.png" alt="Logo" class="bw:grayscale h-8 w-8" />
				{/if}
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end">
			<ion-menu-button class="text-3xl"></ion-menu-button>
		</ion-buttons>
	</ion-toolbar>
	{#if loading && navigationDebounced}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
</ion-header>

<style>
	ion-toolbar {
		--min-height: 3.25rem;
	}
</style>
