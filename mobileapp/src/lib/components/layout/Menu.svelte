<script lang="ts">
	import type { SearchableItemTO } from '$lib/api/dto';

	import * as icons from 'ionicons/icons';
	import { notificationsOutline } from 'ionicons/icons';
	import { onMount, type Snippet } from 'svelte';

	import { goto } from '$app/navigation';
	import type { RouteId } from '$app/types';

	import { authenticationService, searchableService } from '$lib/api/services';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { triggerClickByLabel } from '$lib/utility';

	type Properties = {
		children: Snippet;
	};

	let { children }: Properties = $props();

	let searchedItems = $state<SearchableItemTO[]>([]);
	let searchValue = $state<string>('');
	let menuController: HTMLIonMenuElement;

	export async function navigate(route: RouteId, label?: string): Promise<void> {
		await menuController.close();
		searchValue = '';
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(route);
		if (label) {
			triggerClickByLabel(label);
		}
	}

	async function logout(): Promise<void> {
		await authenticationService.logout();
	}

	async function onSearch(event: CustomEvent): Promise<void> {
		searchValue = event.detail.value;
		searchedItems = await searchableService.filter(searchValue.toLowerCase().trim());
	}

	onMount(() => {
		menuController.addEventListener('ionDidClose', () => (searchValue = ''));
	});
</script>

<ion-menu side="end" content-id="menu" bind:this={menuController}>
	<ion-header>
		<ion-toolbar>
			<div class="flex">
				<ion-searchbar
					class="pt-5"
					color="light"
					debounce={100}
					placeholder={$t('components.menu.header.toolbar.searchbar.placeholder')}
					onionInput={onSearch}
					value={searchValue}
				>
				</ion-searchbar>
				<Button
					fill="clear"
					size="large"
					classList="m-0"
					color="light"
					icon={notificationsOutline}
					clicked={() => navigate('/account/notifications')}
				/>
			</div>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding relative text-center">
		{#if searchValue.trim() !== ''}
			<ion-list>
				<ion-list-header>
					{#if searchedItems.length > 0}
						{$t('components.menu.search-results.found', { value: searchValue, value2: searchedItems.length })}
					{:else}
						{$t('components.menu.search-results.not-found', { value: searchValue })}
					{/if}
				</ion-list-header>
				{#each searchedItems as item (item.id)}
					<LabeledItem
						transparent
						label={item.label}
						icon={icons[item.icon as keyof typeof icons]}
						clicked={() => navigate(item.route, item.label)}
					/>
				{/each}
			</ion-list>
		{:else}
			{@render children()}
		{/if}
		{#if searchValue.trim() === ''}
			<Button
				size="default"
				fill="outline"
				clicked={logout}
				icon={icons.logOutOutline}
				label={$t('components.menu.button.logout')}
			/>
			<hr class="my-3" />
		{/if}
		<div class="fixed right-0 bottom-0 left-0 bg-(--ion-background-color)">
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
