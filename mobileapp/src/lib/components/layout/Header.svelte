<script lang="ts">
	import { onDestroy } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { initializationStore } from '$lib/stores';
	import { navigateBack } from '$lib/utility';

	type Properties = {
		title: string;
		loading?: boolean;
		showBackButton?: boolean;
		unreadNotificationCount?: number;
	};

	let { loading, showBackButton, title, unreadNotificationCount }: Properties = $props();

	const loaded = $derived($initializationStore.loadedServer);

	let timer: ReturnType<typeof setTimeout>;
	let showProgressBar = $state<boolean>(false);

	$effect(() => {
		clearTimeout(timer);

		if (loading || !$loaded) {
			showProgressBar = false;
			timer = setTimeout(() => (showProgressBar = true), 100);
		} else {
			showProgressBar = false;
		}
	});

	onDestroy(() => clearTimeout(timer));

	async function navigate(): Promise<void> {
		return showBackButton ? navigateBack() : goto(resolve('/'));
	}
</script>

<ion-header>
	<ion-toolbar>
		<ion-title>{title}</ion-title>
		<ion-buttons slot="start">
			<ion-button
				role="button"
				tabindex="0"
				onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && navigate()}
				onclick={navigate}
			>
				{#if showBackButton}
					<ion-back-button default-href="/"> </ion-back-button>
				{:else}
					<img src="/logo.png" alt="Logo" class="h-8 w-8 bw:grayscale" />
				{/if}
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end">
			<div class="relative">
				<ion-menu-button class="text-3xl"></ion-menu-button>
				{#if unreadNotificationCount && unreadNotificationCount > 0}
					<ion-badge color="danger" class="absolute -top-1 right-0 z-10">
						{unreadNotificationCount}
					</ion-badge>
				{/if}
			</div>
		</ion-buttons>
	</ion-toolbar>
	{#if showProgressBar}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
</ion-header>

<style>
	ion-toolbar {
		--min-height: 3.25rem;
	}
</style>
