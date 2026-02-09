<script lang="ts">
	import type { QuickAccessItemModel } from '$lib/models/ui';

	import { useSortable } from '@dnd-kit-svelte/svelte/sortable';
	import * as icons from 'ionicons/icons';
	import { closeOutline } from 'ionicons/icons';

	import { Button, Card } from '$lib/components/core';
	import { t } from '$lib/locales';

	type Properties = {
		editMode: boolean;
		index: number;
		item: QuickAccessItemModel;
		isOverlay?: boolean;
		onClick: (item: QuickAccessItemModel) => void;
		onPointerDown: () => void;
		onPointerUp: () => void;
		onRemove: (id: string) => void;
	};

	let {
		editMode,
		index,
		isOverlay = false,
		item,
		onClick,
		onPointerDown,
		onPointerUp,
		onRemove
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
	class="quick-access-item relative mb-8 h-26 select-none"
	class:wiggle={editMode && !isDragging.current}
	class:invisible={isDragging.current && !isOverlay}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	{@attach ref}
>
	<Card
		titleIconStart={icons[item.icon as keyof typeof icons]}
		classList="h-full text-center"
		clicked={() => onClick(item)}
		border="tertiary"
		readonly={editMode}
		ariaLabel={item.label}
	>
		<ion-text class="line-clamp-2 text-sm">{item.label}</ion-text>
	</Card>
	{#if editMode && !isDragging.current}
		<Button
			size="small"
			color="danger"
			classList="absolute top-0 right-0"
			clicked={() => onRemove(item.id)}
			icon={closeOutline}
			ariaLabel={$t('accessibility.actions.remove')}
		/>
	{/if}
</div>

<style>
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(-1deg);
		}
		50% {
			transform: rotate(1deg);
		}
	}

	.wiggle {
		animation: wiggle 0.3s ease-in-out infinite;
	}

	.wiggle:nth-child(2n) {
		animation-delay: 0.075s;
	}
</style>
