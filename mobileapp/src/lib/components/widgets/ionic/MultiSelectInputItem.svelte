<script lang="ts">
	import type { MultiSelectItem } from '$lib/models/ui';

	import { checkmarkOutline } from 'ionicons/icons';
	import { SvelteSet } from 'svelte/reactivity';

	import CustomItem from './CustomItem.svelte';
	import Modal from './Modal.svelte';
	import ToggleItem from './ToggleItem.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		icon: string;
		label: string;
		allSelectedText?: string;
		classList?: string;
		disabled?: boolean;
		hidden?: boolean;
		items?: MultiSelectItem[];
		multiple?: boolean;
		noneSelectedText?: string;
		readonly?: boolean;
		search?: boolean;
		searchPlaceholder?: string;
		selectAllIcon?: string;
		selectAllLabel?: string;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: number[]; changed?: (ids: number[]) => void }
	);

	let {
		allSelectedText = $t('components.widgets.ionic.multi-select-item.all-selected'),
		changed,
		classList = '',
		disabled,
		hidden = false,
		icon,
		items = [],
		label,
		multiple = true,
		name,
		noneSelectedText = $t('components.widgets.ionic.multi-select-item.none-selected'),
		readonly,
		search = true,
		searchPlaceholder = $t('components.widgets.ionic.multi-select-item.search-placeholder'),
		selectAllIcon,
		selectAllLabel = $t('components.widgets.ionic.multi-select-item.select-all'),
		value = []
	}: Properties = $props();

	let rootElement = $state<HTMLElement>();
	let internalValue = $state<number[]>(value);

	let modalOpen = $state<boolean>(false);
	let selectedId = $state<number>();
	let appliedSelectedId = $state<number>();
	let searchValue = $state<string>('');
	let draftSelectedIds = $state<Set<number>>(new Set());

	const currentValue = $derived(name ? internalValue : value);

	const effectiveValue = $derived(getEffectiveValue());
	const visibleItems = $derived(
		search && searchValue.trim().length > 0
			? items.filter((item) => item.data.label.toLowerCase().includes(searchValue.trim().toLowerCase()))
			: items
	);
	const displayedMultiItems = $derived(
		visibleItems.map((item) => ({
			...item,
			selected: draftSelectedIds.has(item.data.id)
		}))
	);
	const allFilteredItemsSelected = $derived(
		items.length > 0 && items.every((item) => draftSelectedIds.has(item.data.id))
	);
	const displayedFilteredValues = $derived(getDisplayedFilteredValues());

	$effect(() => {
		if (!name || !rootElement) return;

		rootElement.addEventListener('modelUpdate', modelUpdateHandler);
		return () => rootElement?.removeEventListener('modelUpdate', modelUpdateHandler);
	});

	$effect(() => {
		if (!name) {
			internalValue = value;
		}

		if (multiple && !modalOpen) {
			draftSelectedIds = new Set(currentValue);
		}

		if (!multiple) {
			const explicit = currentValue[0];
			appliedSelectedId = explicit === undefined ? effectiveValue[0] : explicit;

			selectedId = appliedSelectedId;
		}
	});

	function modelUpdateHandler(event: Event): void {
		return onModelUpdate(event as CustomEvent);
	}

	function getEffectiveValue(): number[] {
		if (multiple) {
			return currentValue;
		}
		const explicit = currentValue[0];
		if (explicit !== undefined) return [explicit];

		const firstSelected = items.find((item) => item.selected)?.data.id;
		return firstSelected === undefined ? [] : [firstSelected];
	}

	function onSearch(event: CustomEvent): void {
		searchValue = event.detail.value ?? '';
	}

	function toggleFilterItemsSelection(selected?: boolean): void {
		draftSelectedIds = selected ? new Set(items.map((item) => item.data.id)) : new Set<number>();
	}

	function getDisplayedFilteredValues(): string {
		if (!multiple) {
			const selected = items.find((item) => item.data.id === appliedSelectedId);
			return selected ? selected.data.label : noneSelectedText;
		}

		const selectedItems = items.filter((item) => effectiveValue.includes(item.data.id));

		if (selectedItems.length === 0) {
			return noneSelectedText;
		}
		if (selectedItems.length > 0 && selectedItems.length === items.length) {
			return allSelectedText;
		}
		return selectedItems.map((item) => item.data.label).join(', ');
	}

	function onConfirm(): void {
		if (multiple) {
			const ids = [...draftSelectedIds];
			if (name) {
				internalValue = ids;
				rootElement?.dispatchEvent(
					new CustomEvent('customChange', {
						bubbles: true,
						detail: { key: name, value: ids }
					})
				);
			} else {
				changed?.(ids);
			}
		} else {
			appliedSelectedId = selectedId;
			const nextId = selectedId ?? 0;
			if (name) {
				internalValue = nextId > 0 ? [nextId] : [];
				rootElement?.dispatchEvent(
					new CustomEvent('customChange', {
						bubbles: true,
						detail: { key: name, value: nextId }
					})
				);
			} else {
				const ids = selectedId === undefined ? [] : [selectedId];
				changed?.(ids);
			}
		}
		searchValue = '';
		modalOpen = false;
	}

	function onDismiss(): void {
		searchValue = '';
		if (multiple) {
			draftSelectedIds = new Set(currentValue);
		}
		if (!multiple) {
			selectedId = appliedSelectedId;
		}
		modalOpen = false;
	}

	function toggleItemSelection(itemId: number): void {
		const next = new SvelteSet(draftSelectedIds);
		if (next.has(itemId)) {
			next.delete(itemId);
		} else {
			next.add(itemId);
		}
		draftSelectedIds = next;
	}

	function openModal(): void {
		searchValue = '';
		if (multiple) {
			draftSelectedIds = new Set(currentValue);
		}
		modalOpen = true;
	}

	function onModelUpdate(event: CustomEvent): void {
		if (!name) return;
		const next = event.detail?.value as unknown;
		if (multiple) {
			if (Array.isArray(next)) {
				internalValue = next.map(Number).filter((value) => Number.isFinite(value) && value > 0);
			} else if (typeof next === 'string') {
				internalValue = next
					.split(',')
					.map((value) => Number(value.trim()))
					.filter((value) => Number.isFinite(value) && value > 0);
			} else if (typeof next === 'number') {
				internalValue = next > 0 ? [next] : [];
			} else {
				internalValue = [];
			}
			return;
		}

		let single: number;
		if (typeof next === 'number') {
			single = next;
		} else if (typeof next === 'string') {
			single = Number(next);
		} else {
			single = 0;
		}
		internalValue = Number.isFinite(single) && single > 0 ? [single] : [];
	}
</script>

<div bind:this={rootElement} data-name={name} class="contents" class:hidden>
	<CustomItem {disabled} {readonly} {classList} {icon} clicked={openModal} {name} {hidden}>
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
		<ion-searchbar
			class="w-full"
			debounce={100}
			placeholder={searchPlaceholder}
			value={searchValue}
			onionInput={onSearch}
		>
		</ion-searchbar>
	{/if}
	{#if multiple}
		<ToggleItem
			disabled={items.length !== visibleItems.length}
			checked={allFilteredItemsSelected}
			label={selectAllLabel}
			icon={selectAllIcon}
			changed={toggleFilterItemsSelection}
		/>
	{/if}
	{#if multiple}
		<ion-list>
			{#each displayedMultiItems as item (item.data.id)}
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
			{#each visibleItems as item (item.data.id)}
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
