<script lang="ts">
	import { onDestroy } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import logo from '$lib/assets/logo.png';
	import { t } from '$lib/locales';
	import { initializationStore } from '$lib/stores';
	import { navigateBack } from '$lib/utility';

	type Properties = {
		title: string;
		loading?: boolean;
		showBackButton?: boolean;
	};

	let { loading, showBackButton, title }: Properties = $props();

	const loaded = $derived(initializationStore.loadedServer);

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
		<ion-title class="text-center">{title}</ion-title>
		<ion-buttons slot="start">
			<ion-button
				role="button"
				tabindex="0"
				aria-label={showBackButton ? $t('accessibility.navigation.back') : $t('accessibility.navigation.home')}
				onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && navigate()}
				onclick={navigate}
			>
				{#if showBackButton}
					<ion-back-button default-href="/" aria-label={$t('accessibility.navigation.back')}></ion-back-button>
				{:else}
					<img src={logo} alt={$t('accessibility.logo')} class="h-8 w-8 bw:grayscale" />
				{/if}
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end">
			<ion-menu-button class="text-3xl" aria-label={$t('accessibility.navigation.menu')}></ion-menu-button>
		</ion-buttons>
	</ion-toolbar>
	{#if showProgressBar}
		<ion-progress-bar type="indeterminate" aria-label={$t('accessibility.loading')}></ion-progress-bar>
	{/if}
</ion-header>

<style>
	ion-toolbar {
		--min-height: 3.25rem;
	}
</style>
