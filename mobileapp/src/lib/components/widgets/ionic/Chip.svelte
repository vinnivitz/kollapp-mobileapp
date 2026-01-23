<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	import type { RouteId } from '$app/types';

	type Properties = {
		label: string;
		classList?: string;
		color?: Colors;
		icon?: string;
		iconColor?: Colors;
		iconEnd?: string;
		indexed?: RouteId;
		selected?: boolean;
		tourId?: string;
		clicked?: () => void;
	};

	let {
		classList = '',
		clicked,
		color = 'secondary',
		icon,
		iconColor,
		iconEnd,
		indexed,
		label,
		selected,
		tourId
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
</script>

<ion-chip
	role="button"
	tabindex="0"
	class={classList}
	{color}
	data-tour={tourId}
	style:background-color={selected ? `color-mix(in srgb, var(--ion-color-${color}) 30%, black 0%)` : 'transparent'}
	outline={!selected}
	onclick={clicked}
	onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && clicked?.()}
>
	<div class="flex items-center justify-between gap-2">
		{#if icon}
			<ion-icon color={iconColor} class="ps-0 text-xs" {icon}></ion-icon>
		{/if}
		<ion-text class="text-center">
			{label}
		</ion-text>
		{#if iconEnd}
			<ion-icon color={iconColor} class="p-0 text-xs" icon={iconEnd}></ion-icon>
		{/if}
	</div>
</ion-chip>
