<script lang="ts">
	import type { PredefinedColors } from '@ionic/core';
	import type { Snippet } from 'svelte';

	import { Layout } from '$lib/models/store';
	import { layoutStore } from '$lib/store';
	import { clickableElement } from '$lib/utils';

	let {
		click,
		children,
		color = 'light',
		detail = false
	}: {
		click?: () => void | Promise<void>;
		children?: Snippet;
		detail?: boolean;
		color?: PredefinedColors;
	} = $props();

	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const isClassicLayout = $derived($layoutStore === Layout.CLASSIC);
</script>

{#if click}
	<ion-item
		{color}
		{detail}
		data-playful={isPlayfulLayout}
		data-classic={isClassicLayout}
		use:clickableElement={click}
	>
		{#if children}
			{@render children?.()}
		{/if}
	</ion-item>
{:else}
	<ion-item {color} {detail} data-playful={isPlayfulLayout} data-classic={isClassicLayout}>
		{#if children}
			{@render children?.()}
		{/if}
	</ion-item>
{/if}

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
</style>
