<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';

	let {
		children,
		click,
		color = 'light',
		detail = false,
		transparent = false,
		button = false,
		iconSrc
	}: {
		children: Snippet;
		click?: () => void | Promise<void>;
		detail?: boolean;
		color?: Colors | undefined;
		transparent?: boolean;
		button?: boolean;
		iconSrc?: string;
	} = $props();

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
	{#if iconSrc}
		{@render icon()}
	{/if}
	{@render children()}
</ion-item>

{#snippet icon()}
	<ion-icon icon={iconSrc} slot="start" color={iconColor}></ion-icon>
{/snippet}

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
