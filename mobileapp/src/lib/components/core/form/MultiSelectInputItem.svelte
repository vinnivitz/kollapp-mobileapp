<script lang="ts">
	import type { MultiSelectItem } from '$lib/models/ui';

	import { checkmarkOutline } from 'ionicons/icons';
	import { SvelteSet } from 'svelte/reactivity';

	import { CustomItem, Modal, ToggleItem } from '$lib/components/core';
	import { FadeInOut } from '$lib/components/core/animation';
	import { t } from '$lib/locales';

	type Properties = {
		icon: string;
		label: string;
		allSelectedText?: string;
		ariaLabel?: string;
		classList?: string;
		disabled?: boolean;
		hidden?: boolean;
		iconEnd?: string;
		items?: MultiSelectItem[];
		multiple?: boolean;
		noneSelectedText?: string;
		readonly?: boolean;
		search?: boolean;
		searchPlaceholder?: string;
		selectAllIcon?: string;
		selectAllLabel?: string;
		iconClicked?: () => void;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: number[]; changed?: (ids: number[]) => void }
	);

	let {
		allSelectedText = $t('components.widgets.ionic.multi-select-item.all-selected'),
		ariaLabel,
		changed,
		classList = '',
		disabled,
		hidden = false,
		icon,
		iconClicked,
		iconEnd,
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

	const computedAriaLabel = $derived(ariaLabel ?? label);

	let rootElement = $state<HTMLDivElement>();

	let modalOpen = $state<boolean>(false);
	let searchValue = $state<string>('');
	let draftSelectedIds = $state<Set<number>>(new Set());

	let formValue = $state<number[]>();

	const selectedFromItems = $derived.by(() => {
		if (multiple) {
			return items.filter((item) => item.selected).map((item) => item.data.id);
		}
		const selected = items.find((item) => item.selected);
		return selected ? [selected.data.id] : [];
	});

	const currentValue = $derived.by(() => {
		if (name) {
			return formValue ?? [];
		}
		return value.length > 0 ? value : selectedFromItems;
	});

	const appliedSelectedId = $derived(currentValue[0]);
	let selectedId = $state<number>();

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

		rootElement.addEventListener('formUpdate', formUpdateHandler);
		return () => rootElement?.removeEventListener('formUpdate', formUpdateHandler);
	});

	$effect(() => {
		if (multiple && !modalOpen) {
			draftSelectedIds = new Set(currentValue);
		}
	});

	$effect(() => {
		if (!multiple) {
			selectedId = appliedSelectedId;
		}
	});

	function formUpdateHandler(event: Event): void {
		onFormUpdate(event as CustomEvent);
	}

	function onFormUpdate(event: CustomEvent): void {
		if (!name) return;
		const next = event.detail?.value as unknown;

		if (multiple) {
			if (Array.isArray(next)) {
				formValue = next.map(Number).filter((v) => Number.isFinite(v) && v > 0);
			} else if (typeof next === 'string') {
				formValue = next
					.split(',')
					.map((v) => Number(v.trim()))
					.filter((v) => Number.isFinite(v) && v > 0);
			} else if (typeof next === 'number') {
				formValue = next > 0 ? [next] : [];
			} else {
				formValue = [];
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
		formValue = Number.isFinite(single) && single > 0 ? [single] : [];
	}

	function getDisplayedFilteredValues(): string {
		if (!multiple) {
			const selected = items.find((item) => item.data.id === appliedSelectedId);
			return selected ? selected.data.label : noneSelectedText;
		}

		const selectedItems = items.filter((item) => currentValue.includes(item.data.id));

		if (selectedItems.length === 0) {
			return noneSelectedText;
		}
		if (selectedItems.length > 0 && selectedItems.length === items.length) {
			return allSelectedText;
		}
		return selectedItems.map((item) => item.data.label).join(', ');
	}

	function onSearch(event: CustomEvent): void {
		searchValue = event.detail.value ?? '';
	}

	function toggleFilterItemsSelection(selected?: boolean): void {
		draftSelectedIds = selected ? new Set(items.map((item) => item.data.id)) : new Set<number>();
	}

	function onConfirm(): void {
		if (multiple) {
			const ids = [...draftSelectedIds];
			if (name) {
				formValue = ids;
				rootElement?.dispatchEvent(
					new CustomEvent('ionInput', {
						bubbles: true,
						detail: { key: name, value: ids }
					})
				);
			} else {
				changed?.(ids);
			}
		} else {
			const nextId = selectedId ?? 0;
			if (name) {
				formValue = nextId > 0 ? [nextId] : [];
				rootElement?.dispatchEvent(
					new CustomEvent('ionInput', {
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
		onBlur();
	}

	function onBlur(): void {
		rootElement?.dispatchEvent(
			new CustomEvent('ionBlur', {
				bubbles: true,
				detail: { key: name }
			})
		);
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
</script>

<CustomItem
	bind:element={rootElement}
	{iconEnd}
	{iconClicked}
	{disabled}
	{readonly}
	classList={`${classList} ${hidden ? 'hidden' : ''}`}
	{icon}
	clicked={openModal}
	{name}
	{hidden}
	ariaLabel={computedAriaLabel}
>
	<div class="flex flex-col">
		<ion-text class="pt-2 text-xs">{label}</ion-text>
		<ion-text class="my-2 truncate">
			{displayedFilteredValues}
		</ion-text>
	</div>
</CustomItem>

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
				<FadeInOut>
					<CustomItem>
						<ion-checkbox
							value={item.data.id}
							checked={item.selected}
							color={item.color}
							aria-label={item.data.label}
							onionChange={() => toggleItemSelection(item.data.id)}
						>
							<div class="flex items-center justify-center gap-2">
								{#if item.icon}
									<ion-icon color={item.color} icon={item.icon} aria-hidden="true"></ion-icon>
								{/if}
								<ion-text color={item.color ?? 'dark'}>
									{item.data.label}
								</ion-text>
							</div>
						</ion-checkbox>
					</CustomItem>
				</FadeInOut>
			{/each}
		</ion-list>
	{:else}
		<ion-radio-group value={selectedId}>
			{#each visibleItems as item (item.data.id)}
				<FadeInOut>
					<CustomItem>
						<ion-radio
							value={item.data.id}
							role="presentation"
							onclick={() => (selectedId = item.data.id)}
							onkeydown={(event_: KeyboardEvent) => event_.key === 'Enter' && (selectedId = item.data.id)}
							color={item.color}
							aria-label={item.data.label}
						>
							<div class="flex items-center justify-center gap-2">
								{#if item.icon}
									<ion-icon color={item.color} icon={item.icon} aria-hidden="true"></ion-icon>
								{/if}
								<ion-text color={item.color ?? 'dark'}>
									{item.data.label}
								</ion-text>
							</div>
						</ion-radio>
					</CustomItem>
				</FadeInOut>
			{/each}
		</ion-radio-group>
	{/if}
</Modal>
