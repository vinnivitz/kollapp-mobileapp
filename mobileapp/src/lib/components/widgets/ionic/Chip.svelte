<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		label: string;
		classList?: string;
		color?: Colors;
		icon?: string;
		iconEnd?: string;
		selected?: boolean;
		clicked?: () => void;
	};

	let { classList = '', clicked, color = 'secondary', icon, iconEnd, label, selected }: Properties = $props();
</script>

<ion-chip
	role="button"
	tabindex="0"
	class={classList}
	{color}
	outline={!selected}
	onclick={clicked}
	onkeydown={(_event) => _event.key === 'Enter' && clicked?.()}
>
	<div class="flex items-center justify-between gap-2">
		{#if icon}
			<ion-icon class="ps-0 text-xs" {icon}></ion-icon>
		{/if}
		{label}
		{#if iconEnd}
			<ion-icon class="p-0 text-xs" icon={iconEnd}></ion-icon>
		{/if}
	</div>
</ion-chip>
