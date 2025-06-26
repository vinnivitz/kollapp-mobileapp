<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		label: string;
		classList?: string;
		color?: Colors;
		icon?: string;
		iconEnd?: string;
		selected?: boolean;
		click?: () => void;
	};

	let { classList, click, color = 'secondary', icon, iconEnd, label, selected }: Properties = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ion-chip class={classList} {color} outline={!selected} onclick={click}>
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
