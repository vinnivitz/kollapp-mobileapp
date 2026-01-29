<script lang="ts">
	import type { QuickAccessItem } from '$lib/models/ui';

	import { Haptics } from '@capacitor/haptics';
	import { TZDate } from '@date-fns/tz';
	import { move } from '@dnd-kit/helpers';
	import { DragDropProvider, DragOverlay, KeyboardSensor, PointerSensor } from '@dnd-kit-svelte/svelte';
	import { checkmarkOutline, createOutline, informationCircleOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	import QuickAccessAddModal from './QuickAccessAddModal.svelte';
	import QuickAccessItemComponent from './QuickAccessItem.svelte';
	import QuickAccessSpecialWidget from './QuickAccessSpecialWidget.svelte';

	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { organizationStore, quickAccessStore } from '$lib/stores';
	import { clickOutside, triggerClickByLabel } from '$lib/utility';

	const LONG_PRESS_DURATION_MS = 500;

	let longPressTimer: ReturnType<typeof setTimeout> | undefined;

	const storeState = $derived($quickAccessStore);
	let items = $derived(storeState.items);
	const editMode = $derived(storeState.editMode);

	let dndItems = $state<Record<string, QuickAccessItem[]>>({ items: [] });
	let modalOpen = $state<boolean>(false);

	const organization = $derived($organizationStore);

	const activity = $derived.by(() => {
		if (!$organizationStore?.activities || $organizationStore.activities.length === 0) {
			return;
		}
		const sorted = $organizationStore.activities.toSorted(
			(a, b) => new TZDate(a.date).getTime() - new TZDate(b.date).getTime()
		);
		const upcoming = sorted.find((a) => new TZDate(a.date).getTime() > TZDate.now());
		return upcoming;
	});

	const postings = $derived(
		$organizationStore
			? [
					...$organizationStore.organizationPostings,
					...$organizationStore.activities.flatMap((activity) => activity.activityPostings)
				]
			: []
	);

	$effect(() => {
		dndItems = { items: [...items] };
	});

	onMount(async () => quickAccessStore.initialize());

	function handlePointerDown(): void {
		if (editMode) return;

		longPressTimer = setTimeout(async () => {
			quickAccessStore.setEditMode(true);
			try {
				await Haptics.vibrate({ duration: 50 });
			} catch {
				if (dev) console.info('Haptics not available');
			}
		}, LONG_PRESS_DURATION_MS);
	}

	function clearLongPressTimer(): void {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = undefined;
		}
	}

	async function handleItemClick(item: QuickAccessItem): Promise<void> {
		if (editMode) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(item.route);
		if (item.label) {
			await triggerClickByLabel(item.label);
		}
	}

	function handleRemoveItem(id: string): void {
		quickAccessStore.removeItem(id);
	}

	function onExitEditMode(): void {
		quickAccessStore.setEditMode(false);
	}

	function handleGridClick(event: MouseEvent): void {
		if (editMode && event.target === event.currentTarget) {
			onExitEditMode();
		}
	}

	const configuredPointerSensor = PointerSensor.configure({
		activationConstraints: { distance: { value: 3 } }
	});
</script>

<div data-tour={TourStepId.HOME.QUICK_ACCESS} class="relative mt-5" use:clickOutside={onExitEditMode}>
	{#if !editMode && dndItems.items && dndItems.items.length > 0}
		<ion-text color="medium" class="flex flex-row items-center justify-center gap-1">
			<ion-icon icon={informationCircleOutline} aria-hidden="true"></ion-icon>
			<ion-label class="block text-center text-sm">
				{$t('routes.page.page.quick-access.hint')}
			</ion-label>
		</ion-text>
	{/if}
	{#if editMode}
		<Button
			color="primary"
			fill="outline"
			classList="mx-4"
			expand="block"
			clicked={onExitEditMode}
			icon={checkmarkOutline}
			label={$t('routes.page.page.quick-access.done')}
		/>
	{/if}
	<DragDropProvider
		sensors={[configuredPointerSensor, KeyboardSensor]}
		onDragOver={(event) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dndItems = move(dndItems, event as any);
		}}
		onDragEnd={() => quickAccessStore.reorderItems(dndItems.items ?? [])}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="grid grid-cols-2 gap-0" onclick={handleGridClick}>
			{#each dndItems.items as item, index (item.id)}
				{#if item.widgetType === 'special'}
					<QuickAccessSpecialWidget
						{item}
						{index}
						{editMode}
						{organization}
						{activity}
						{postings}
						onRemove={handleRemoveItem}
						onPointerDown={handlePointerDown}
						onPointerUp={clearLongPressTimer}
					/>
				{:else}
					<QuickAccessItemComponent
						{item}
						{index}
						{editMode}
						onRemove={handleRemoveItem}
						onClick={handleItemClick}
						onPointerDown={handlePointerDown}
						onPointerUp={clearLongPressTimer}
					/>
				{/if}
			{/each}
		</div>
		{#if editMode}
			<FabButton icon={createOutline} clicked={() => (modalOpen = true)} ariaLabel={$t('accessibility.actions.add')} />
		{/if}

		<DragOverlay>
			{#snippet children(source)}
				{@const item = dndItems.items?.find((index) => index.id === source.id)}
				{#if item}
					{#if item.widgetType === 'special'}
						<QuickAccessSpecialWidget
							{item}
							index={0}
							{editMode}
							isOverlay
							{organization}
							{activity}
							{postings}
							onRemove={handleRemoveItem}
							onPointerDown={handlePointerDown}
							onPointerUp={clearLongPressTimer}
						/>
					{:else}
						<QuickAccessItemComponent
							{item}
							index={0}
							{editMode}
							isOverlay
							onRemove={handleRemoveItem}
							onClick={handleItemClick}
							onPointerDown={handlePointerDown}
							onPointerUp={clearLongPressTimer}
						/>
					{/if}
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</div>

<QuickAccessAddModal open={modalOpen} dismissed={() => (modalOpen = false)} />
