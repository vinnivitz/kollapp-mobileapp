<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		label: string;
		color?: Colors;
		icon?: string;
		iconEnd?: string;
		selected?: boolean;
		clicked?: () => void;
	};

	let { clicked, color = 'secondary', icon, iconEnd, label, selected }: Properties = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ion-chip {color} outline={selected} onclick={clicked}>
	{#if icon}
		<ion-icon class="text-xs" {icon}></ion-icon>
	{/if}
	{label}
	{#if iconEnd}
		<ion-icon class="text-xs" icon={iconEnd}></ion-icon>
	{/if}
</ion-chip>
