<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';
	import { clickableElement } from '$lib/utils';

	let {
		click,
		children,
		color = 'light',
		detail = false,
		iconSrc,
		label,
		transparent = false
	}: {
		click?: () => void | Promise<void>;
		children?: Snippet;
		detail?: boolean;
		color?: Colors | undefined;
		iconSrc?: string;
		label?: string;
		transparent?: boolean;
	} = $props();

	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const isClassicLayout = $derived($layoutStore === Layout.CLASSIC);
</script>

<ion-item
	{color}
	{detail}
	data-playful={isPlayfulLayout}
	data-classic={isClassicLayout}
	data-transparent={transparent}

	use:clickableElement={() => click?.()}
>
	{#if iconSrc || label}
		<div class="flex flex-row items-center gap-4">
			{#if iconSrc}
				<ion-icon icon={iconSrc} size="large"></ion-icon>
			{/if}
			{#if label}
				<ion-label>{label}</ion-label>
			{/if}
		</div>
	{:else if children}
		{@render children?.()}
	{/if}
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
