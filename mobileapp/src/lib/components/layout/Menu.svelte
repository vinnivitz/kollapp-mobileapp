<script lang="ts">
	import type { SearchableItemDto } from '$lib/api/dto/server';
	import type { Snippet } from 'svelte';

	import * as icons from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { authResource, searchableResource } from '$lib/api/resources';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { type PageRoutePaths } from '$lib/models/routing';
	import { triggerClickByLabel } from '$lib/utility';

	type Properties = {
		children: Snippet;
	};

	let { children }: Properties = $props();

	let searchedItems = $state<SearchableItemDto[]>([]);
	let searchValue = $state('');
	let menuController: HTMLIonMenuElement;

	export async function navigate(route: PageRoutePaths, label?: string): Promise<void> {
		await menuController.close();
		searchValue = '';
		await goto(route);
		if (label) {
			triggerClickByLabel(label);
		}
	}

	async function logout(): Promise<void> {
		await authResource.logout();
	}

	async function onSearch(event: CustomEvent): Promise<void> {
		searchValue = event.detail.value;
		searchedItems = await searchableResource.filter(searchValue.toLowerCase());
	}
</script>

<ion-menu side="end" content-id="menu" bind:this={menuController}>
	<ion-header>
		<ion-toolbar>
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-searchbar
				class="pt-5"
				color="light"
				debounce={100}
				placeholder={$t('components.layout.menu.searchbar.placeholder')}
				on:ionInput={onSearch}
				value={searchValue}
			>
			</ion-searchbar>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding relative text-center">
		{#if searchValue !== ''}
			<ion-list>
				<ion-list-header>
					{#if searchedItems.length > 0}
						{$t('components.layout.menu.searchbar.title.found', { value: searchValue })}
					{:else}
						{$t('components.layout.menu.searchbar.title.not-found', { value: searchValue })}
					{/if}
				</ion-list-header>
				{#each searchedItems as item (item.id)}
					<LabeledItem
						transparent
						label={item.label}
						icon={icons[item.icon as keyof typeof icons]}
						click={() => navigate(item.route, item.label)}
					/>
				{/each}
			</ion-list>
		{:else}
			{@render children()}
		{/if}
		{#if searchValue === ''}
			<Button
				size="default"
				fill="outline"
				click={logout}
				icon={icons.logOutOutline}
				label={$t('components.layout.header.button.logout')}
			/>
			<hr class="my-3" />
		{/if}
		<div class="fixed right-0 bottom-0 left-0 bg-[var(--ion-background-color)]">
			<ion-note>
				Made with <ion-text color="danger">&#10084;</ion-text> from Dresden.
			</ion-note>
		</div>
	</ion-content>
</ion-menu>

<style>
	ion-searchbar {
		padding: 0 4px;
	}

	ion-toolbar::part(container) {
		min-height: 52px;
	}
</style>
