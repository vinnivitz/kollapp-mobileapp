<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	type Properties = {
		children: Snippet;
		button?: boolean;
		card?: boolean;
		classList?: string;
		color?: Colors | undefined;
		disabled?: boolean;
		icon?: string;
		iconColor?: Colors;
		iconEnd?: string;
		id?: string;
		searchable?: string;
		transparent?: boolean;
		click?: () => void;
		iconClick?: () => void;
	};

	let {
		button = false,
		card = false,
		children,
		classList,
		click,
		color = 'light',
		disabled = false,
		icon,
		iconClick,
		iconColor,
		iconEnd,
		id,
		searchable,
		transparent = false
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;

	const _iconColor = $derived(iconColor ?? (color === 'light' || color === 'white' ? 'medium' : 'white'));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ion-item
	{disabled}
	{id}
	data-card={card}
	button={!!click || button}
	{color}
	detail={!!click}
	data-transparent={transparent}
	onclick={click}
	class={classList}
	style="--ion-color-shade: var(--border-color) !important;"
>
	{#if icon}
		<ion-icon {icon} slot="start" color={_iconColor}></ion-icon>
	{/if}
	{#if iconEnd}
		<ion-button class="ms-0" fill="clear" slot="end" onclick={iconClick}>
			<ion-icon icon={iconEnd} color="secondary" slot="icon-only" size="large"></ion-icon>
		</ion-button>
	{/if}
	{@render children()}
</ion-item>

<style>
	ion-item[data-card='true']::part(native) {
		background-color: var(--ion-background-color-step-100);
	}

	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
