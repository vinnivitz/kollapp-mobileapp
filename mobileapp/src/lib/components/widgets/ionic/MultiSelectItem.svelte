<script lang="ts">
	import type { SelectItem } from '$lib/models/ui';

	import { checkmarkOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import CustomItem from './CustomItem.svelte';
	import Modal from './Modal.svelte';
	import ToggleItem from './ToggleItem.svelte';

	type Properties = {
		icon: string;
		label: string;
		allSelectedText?: string;
		items?: SelectItem[];
		multiple?: boolean;
		noneSelectedText?: string;
		search?: boolean;
		searchPlaceholder?: string;
		selectAllIcon?: string;
		selectAllLabel?: string;
		changed?: (ids: number[]) => void;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: number[]; changed?: (ids: number[]) => void }
	);

	let {
		allSelectedText = 'All selected',
		changed,
		icon,
		items = [],
		label,
		multiple = true,
		name,
		noneSelectedText = 'None selected',
		search = true,
		searchPlaceholder = 'Search...',
		selectAllIcon,
		selectAllLabel = 'All selected',
		value = []
	}: Properties = $props();

	let modalOpen = $state<boolean>(false);
	let filteredItems = $state<SelectItem[]>([]);
	let selectedId = $state<number>();
	let containerElement = $state<HTMLDivElement>();
	let internalValue = $state<number[]>(value);

	const allFilteredItemsSelected = $derived(filteredItems.length > 0 && filteredItems.every((item) => item.selected));
	const displayedFilteredValues = $derived(getDisplayedFilteredValues());

	$effect(() => {
		internalValue = value;
	});

	$effect(() => {
		const currentValue = internalValue;

		filteredItems = items.map((item) => ({
			...item,
			selected: currentValue.includes(item.data.id)
		}));

		if (!multiple) {
			selectedId = currentValue[0];
		}
	});

	function handleModelUpdate(event: Event): void {
		const customEvent = event as CustomEvent;
		const modelValue = customEvent.detail.value as number[];

		if (Array.isArray(modelValue)) {
			internalValue = modelValue;
		}
	}

	onMount(() => {
		if (!containerElement) return;

		containerElement.addEventListener('modelUpdate', handleModelUpdate);

		return () => {
			if (containerElement) {
				containerElement.removeEventListener('modelUpdate', handleModelUpdate);
			}
		};
	});

	function dispatchCustomChange(selectedIds: number[]): void {
		if (containerElement && name) {
			containerElement.dispatchEvent(
				new CustomEvent('customChange', {
					bubbles: true,
					detail: {
						key: name,
						value: selectedIds
					}
				})
			);
		}
	}

	function onSearch(event: CustomEvent): void {
		const value = event.detail.value;
		filteredItems = items
			.filter((item) => item.data.label.toLowerCase().includes(value.toLowerCase()))
			.map((item) => ({ ...item }));
	}

	function toggleFilterItemsSelection(selected?: boolean): void {
		filteredItems = filteredItems.map((item) => ({ ...item, selected: selected ?? false }));
	}

	function getDisplayedFilteredValues(): string {
		const selectedItems = items.filter((item) => internalValue.includes(item.data.id));

		if (!multiple) {
			const selected = selectedItems[0];
			return selected ? selected.data.label : noneSelectedText;
		}

		if (selectedItems.length === 0) {
			return noneSelectedText;
		}
		if (selectedItems.length === items.length) {
			return allSelectedText;
		}
		return selectedItems.map((item) => item.data.label).join(', ');
	}

	function onConfirm(): void {
		const selectedIds = filteredItems.filter((item) => item.selected).map((item) => item.data.id);

		internalValue = selectedIds;

		if (multiple) {
			changed?.(selectedIds);
			dispatchCustomChange(selectedIds);
		} else {
			const ids = selectedId ? [selectedId] : [];
			changed?.(ids);
			dispatchCustomChange(ids);
		}
		modalOpen = false;
	}

	function onDismiss(): void {
		if (!multiple) {
			selectedId = internalValue[0];
		}
		filteredItems = items.map((item) => ({
			...item,
			selected: internalValue.includes(item.data.id)
		}));
		modalOpen = false;
	}

	function toggleItemSelection(itemId: number): void {
		filteredItems = filteredItems.map((item) =>
			item.data.id === itemId ? { ...item, selected: !item.selected } : item
		);
	}
</script>

<div bind:this={containerElement}>
	<CustomItem {icon} clicked={() => (modalOpen = true)} {name}>
		<div class="flex flex-col">
			<ion-text class="ms-3 pt-2 text-xs">{label}</ion-text>
			<ion-text class="my-2 ms-4 truncate">
				{displayedFilteredValues}
			</ion-text>
		</div>
	</CustomItem>
</div>

<Modal
	open={modalOpen}
	dismissed={onDismiss}
	title={label}
	confirmIcon={checkmarkOutline}
	confirmed={onConfirm}
	labels={false}
>
	{#if search}
		<ion-searchbar class="w-full" debounce={100} placeholder={searchPlaceholder} onionInput={onSearch}> </ion-searchbar>
	{/if}
	{#if multiple}
		<ToggleItem
			disabled={items.length !== filteredItems.length}
			checked={allFilteredItemsSelected}
			label={selectAllLabel}
			icon={selectAllIcon}
			change={toggleFilterItemsSelection}
		/>
	{/if}
	{#if multiple}
		<ion-list>
			{#each filteredItems as item (item.data.id)}
				<CustomItem>
					<ion-checkbox
						value={item.data.id}
						checked={item.selected}
						color={item.color}
						onionChange={() => toggleItemSelection(item.data.id)}
					>
						<div class="flex items-center justify-center gap-2">
							{#if item.icon}
								<ion-icon color={item.color} icon={item.icon}></ion-icon>
							{/if}
							<ion-text color={item.color ?? 'dark'}>
								{item.data.label}
							</ion-text>
						</div>
					</ion-checkbox>
				</CustomItem>
			{/each}
		</ion-list>
	{:else}
		<ion-radio-group value={selectedId}>
			{#each filteredItems as item (item.data.id)}
				<CustomItem>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<ion-radio value={item.data.id} onclick={() => (selectedId = item.data.id)} color={item.color}>
						<div class="flex items-center justify-center gap-2">
							{#if item.icon}
								<ion-icon color={item.color} icon={item.icon}></ion-icon>
							{/if}
							<ion-text color={item.color ?? 'dark'}>
								{item.data.label}
							</ion-text>
						</div>
					</ion-radio>
				</CustomItem>
			{/each}
		</ion-radio-group>
	{/if}
</Modal>
