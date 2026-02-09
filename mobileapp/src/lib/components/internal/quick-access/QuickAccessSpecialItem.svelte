<script lang="ts">
	import type { QuickAccessItemModel } from '$lib/models/ui';
	import type { ActivityTO, OrganizationTO, PostingTO } from '@kollapp/api-types';

	import { useSortable } from '@dnd-kit-svelte/svelte/sortable';
	import { closeOutline } from 'ionicons/icons';

	import { Button } from '$lib/components/core';
	import { BudgetChart } from '$lib/components/internal/budget/statistics';
	import { OrganizationCard, UpcomingActivityCard } from '$lib/components/internal/quick-access';
	import { TourStepId } from '$lib/models/ui';

	type Properties = {
		activity: ActivityTO | undefined;
		editMode: boolean;
		index: number;
		item: QuickAccessItemModel;
		postings: PostingTO[];
		isOverlay?: boolean;
		organization?: OrganizationTO;
		onPointerDown: () => void;
		onPointerUp: () => void;
		onRemove: (id: string) => void;
	};

	let {
		activity,
		editMode,
		index,
		isOverlay = false,
		item,
		onPointerDown,
		onPointerUp,
		onRemove,
		organization,
		postings
	}: Properties = $props();

	const { isDragging, ref } = $derived(
		useSortable({
			disabled: () => !editMode,
			group: 'items',
			id: item.id,
			index: () => index
		})
	);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative col-span-2 select-none"
	class:wiggle={editMode && !isDragging.current}
	class:invisible={isDragging.current && !isOverlay}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	{@attach ref}
>
	{#if item.widgetType === 'special'}
		{#if item.specialWidgetId === 'organization-card'}
			<OrganizationCard {organization} {editMode} />
		{:else if item.specialWidgetId === 'upcoming-activity-card'}
			<UpcomingActivityCard {activity} {editMode} />
		{:else if item.specialWidgetId === 'budget-chart-card'}
			<BudgetChart {editMode} {postings} tourId={TourStepId.HOME.BUDGET_CHART} />
		{/if}
	{/if}

	{#if editMode && !isDragging.current}
		<Button
			size="small"
			color="danger"
			classList="absolute top-0 right-0 z-10"
			clicked={() => onRemove(item.id)}
			icon={closeOutline}
		/>
	{/if}
</div>

<style>
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(-0.5deg);
		}
		50% {
			transform: rotate(0.5deg);
		}
	}

	.wiggle {
		animation: wiggle 0.3s ease-in-out infinite;
	}

	.wiggle:nth-child(2n) {
		animation-delay: 0.075s;
	}
</style>
