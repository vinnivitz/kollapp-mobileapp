<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	type Properties = {
		children: Snippet;
		card?: boolean;
		color?: Colors | undefined;
		iconEnd?: string;
		iconStart?: string;
		transparent?: boolean;
		click?: () => void;
		iconClick?: () => void;
	};

	let {
		card = false,
		children,
		click,
		color = 'light',
		iconClick,
		iconEnd,
		iconStart,
		transparent = false
	}: Properties = $props();

	const iconColor = $derived(color === 'light' || color === 'white' ? 'medium' : 'white');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ion-item data-card={card} button={!!click} {color} detail={!!click} data-transparent={transparent} onclick={click}>
	{#if iconStart}
		<ion-icon icon={iconStart} slot="start" color={iconColor}></ion-icon>
	{/if}
	{#if iconEnd}
		<ion-button fill="clear" slot="end" onclick={iconClick}>
			<ion-icon icon={iconEnd} slot="icon-only" size="large"></ion-icon>
		</ion-button>
	{/if}
	{@render children()}
</ion-item>

<style>
	ion-item::part(native) {
		margin-bottom: 5px;
	}

	ion-item[data-card='true']::part(native) {
		background-color: var(--ion-background-color-step-100);
	}

	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
