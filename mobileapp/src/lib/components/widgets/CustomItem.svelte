<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Colors, Layout } from '$lib/models/ui';
	import { layoutStore } from '$lib/stores';

	type Properties = {
		button?: boolean;
		children: Snippet;
		click?: () => void | Promise<void>;
		color?: Colors | undefined;
		detail?: boolean;
		iconClick?: () => void | Promise<void>;
		iconEnd?: string;
		iconStart?: string;
		transparent?: boolean;
	};

	let {
		button = false,
		children,
		click,
		color = 'light',
		detail = false,
		iconClick,
		iconEnd,
		iconStart,
		transparent = false
	}: Properties = $props();

	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const isClassicLayout = $derived($layoutStore === Layout.CLASSIC);
	const iconColor = $derived(color === 'light' || color === 'white' ? 'medium' : 'white');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<ion-item
	{button}
	{color}
	{detail}
	data-playful={isPlayfulLayout}
	data-classic={isClassicLayout}
	data-transparent={transparent}
	onclick={click}
>
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

<style lang="postcss">
	ion-item::part(native) {
		margin-bottom: 5px;
	}

	ion-item[data-playful='true']::part(native) {
		border-radius: 20px;
	}
	ion-item[data-classic='true']::part(native) {
		border-radius: 5px;
	}

	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
