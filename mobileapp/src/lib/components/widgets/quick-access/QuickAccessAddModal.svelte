<script lang="ts">
	import type { SearchableItemTO } from '$lib/api/dto';
	import type { ItemSlidingOption, QuickAccessItem } from '$lib/models/ui';

	import * as icons from 'ionicons/icons';
	import { addCircleOutline, trashOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import type { RouteId } from '$app/types';

	import { searchableService } from '$lib/api/services';
	import FadeInOut from '$lib/components/utility/FadeInOut.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import { t } from '$lib/locales';
	import { quickAccessStore, SPECIAL_WIDGETS } from '$lib/stores';

	type Properties = {
		open: boolean;
		dismissed: () => void;
	};

	let { dismissed, open }: Properties = $props();

	let searchValue = $state('');
	let searchedItems = $state<SearchableItemTO[]>([]);
	let allItems = $state<SearchableItemTO[]>([]);

	const currentItems = $derived($quickAccessStore.items);
	const currentNormalItems = $derived(currentItems.filter((item) => item.widgetType !== 'special'));
	const currentSpecialItems = $derived(currentItems.filter((item) => item.widgetType === 'special'));
	const isSearching = $derived(searchValue.trim() !== '');

	// Check which special widgets are not yet added
	const availableSpecialWidgets = $derived(
		SPECIAL_WIDGETS().filter((widget) => !currentItems.some((item) => item.id === widget.id))
	);

	const availableItems = $derived(allItems.filter((item) => !isItemAdded(item)));

	onMount(async () => {
		const items = await searchableService.filter('');
		allItems = items.toSorted((a, b) => a.label.localeCompare(b.label));
	});

	async function onSearch(event: CustomEvent): Promise<void> {
		searchValue = event.detail.value ?? '';
		searchedItems = searchValue.trim() === '' ? [] : await searchableService.filter(searchValue.toLowerCase().trim());
	}

	function isItemAdded(item: SearchableItemTO): boolean {
		return currentItems.some((index) => index.route === item.route && index.label === item.label);
	}

	function handleAddItem(item: SearchableItemTO): void {
		const newItem: QuickAccessItem = {
			icon: item.icon ?? 'ellipsisHorizontalOutline',
			id: `${item.route}-${Date.now()}`,
			label: item.label,
			route: item.route as RouteId,
			widgetType: 'normal'
		};
		quickAccessStore.addItem(newItem);
		searchValue = '';
	}

	function handleAddSpecialWidget(widget: QuickAccessItem): void {
		quickAccessStore.addItem(widget);
	}

	function handleRemoveItem(item: SearchableItemTO): void {
		const existing = currentItems.find((index) => index.route === item.route && index.label === item.label);
		if (existing) {
			quickAccessStore.removeItem(existing.id);
		}
	}

	function getAddSlidingOption(item: SearchableItemTO): ItemSlidingOption[] {
		return [
			{
				color: 'success',
				handler: () => handleAddItem(item),
				icon: addCircleOutline,
				label: $t('routes.page.page.quick-access.add')
			}
		];
	}

	function getAddSpecialWidgetSlidingOption(widget: QuickAccessItem): ItemSlidingOption[] {
		return [
			{
				color: 'success',
				handler: () => handleAddSpecialWidget(widget),
				icon: addCircleOutline,
				label: $t('routes.page.page.quick-access.add')
			}
		];
	}

	function getRemoveSlidingOption(item: SearchableItemTO): ItemSlidingOption[] {
		return [
			{
				color: 'danger',
				handler: () => handleRemoveItem(item),
				icon: trashOutline,
				label: $t('routes.page.page.quick-access.remove')
			}
		];
	}

	function getRemoveSlidingOptionById(id: string): ItemSlidingOption[] {
		return [
			{
				color: 'danger',
				handler: () => quickAccessStore.removeItem(id),
				icon: trashOutline,
				label: $t('routes.page.page.quick-access.remove')
			}
		];
	}

	function handleDismiss(): void {
		searchValue = '';
		searchedItems = [];
		dismissed();
	}
</script>

<Modal lazy {open} dismissed={handleDismiss} informational title={$t('routes.page.page.quick-access.modal.title')}>
	<div class="sticky top-0 left-0 z-10">
		<ion-searchbar
			color="light"
			debounce={100}
			placeholder={$t('routes.page.page.quick-access.modal.search-placeholder')}
			onionInput={onSearch}
			value={searchValue}
		></ion-searchbar>
	</div>

	{#if isSearching}
		{#if searchedItems.length > 0}
			<FadeInOut>
				<ion-list>
					<ion-list-header>
						{$t('routes.page.page.quick-access.modal.results-for', {
							value: searchedItems.length,
							value2: searchValue
						})}
					</ion-list-header>
					{#each searchedItems as item (item.id)}
						{@const added = isItemAdded(item)}
						<CustomItem
							icon={icons[item.icon as keyof typeof icons] ?? icons.ellipsisHorizontalOutline}
							slidingOptions={added ? getRemoveSlidingOption(item) : getAddSlidingOption(item)}
						>
							<ion-label class="ms-2">{item.label}</ion-label>
						</CustomItem>
					{/each}
				</ion-list>
			</FadeInOut>
		{:else}
			<div class="py-8 text-center">
				<ion-note>{$t('routes.page.page.quick-access.modal.no-results', { value: searchValue })}</ion-note>
			</div>
		{/if}
	{:else}
		{#if currentItems.length > 0}
			<ion-list>
				<ion-list-header>
					{$t('routes.page.page.quick-access.modal.current-items-header')}
				</ion-list-header>
				{#each currentNormalItems as item (item.id)}
					<CustomItem
						icon={icons[item.icon as keyof typeof icons] ?? icons.ellipsisHorizontalOutline}
						slidingOptions={getRemoveSlidingOptionById(item.id)}
					>
						<ion-label class="ms-2">{item.label}</ion-label>
					</CustomItem>
				{/each}
				{#each currentSpecialItems as widget (widget.id)}
					<CustomItem
						badgeEnd={$t('components.widgets.quick-access.special-widget.badge')}
						badgeColor="secondary"
						icon={icons[widget.icon as keyof typeof icons] ?? icons.ellipsisHorizontalOutline}
						slidingOptions={getRemoveSlidingOptionById(widget.id)}
					>
						<ion-label class="ms-2">
							{widget.label}
						</ion-label>
					</CustomItem>
				{/each}
			</ion-list>
		{/if}

		{#if availableSpecialWidgets.length > 0}
			<ion-list class="mt-4">
				<ion-list-header>
					{$t('routes.page.page.quick-access.modal.special-widgets-header')}
				</ion-list-header>
				{#each availableSpecialWidgets as widget (widget.id)}
					<CustomItem
						badgeEnd={$t('components.widgets.quick-access.special-widget.badge')}
						badgeColor="secondary"
						icon={icons[widget.icon as keyof typeof icons] ?? icons.ellipsisHorizontalOutline}
						slidingOptions={getAddSpecialWidgetSlidingOption(widget)}
					>
						<ion-label class="ms-2">{widget.label}</ion-label>
					</CustomItem>
				{/each}
			</ion-list>
		{/if}

		<ion-list class="mt-4">
			<ion-list-header>
				{$t('routes.page.page.quick-access.modal.all-functions')}
			</ion-list-header>
			{#each availableItems as item (item.id)}
				<CustomItem
					icon={icons[item.icon as keyof typeof icons] ?? icons.ellipsisHorizontalOutline}
					slidingOptions={getAddSlidingOption(item)}
				>
					<ion-label class="ms-2">{item.label}</ion-label>
				</CustomItem>
			{/each}
		</ion-list>
	{/if}
</Modal>
