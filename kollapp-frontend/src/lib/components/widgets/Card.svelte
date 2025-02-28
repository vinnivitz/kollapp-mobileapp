<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';

	let {
		title,
		subtitle,
		children,
		color,
		titleOnly = false
	}: {
		title?: string;
		subtitle?: string;
		children?: Snippet;
		color?: Colors | undefined;
		titleOnly?: boolean;
	} = $props();

	const isModernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
</script>

<ion-card {color} class:rounded-3xl={isPlayfulLayout} class:squared={isModernLayout}>
	{#if title || subtitle}
		<ion-card-header>
			<ion-card-title class="text-center">{title}</ion-card-title>
			{#if subtitle}
				<ion-card-subtitle>{subtitle}</ion-card-subtitle>
			{/if}
		</ion-card-header>
	{/if}
	{#if children && !titleOnly}
		<ion-card-content>
			{@render children?.()}
		</ion-card-content>
	{/if}
</ion-card>

<style lang="postcss">
	.squared {
		border-radius: unset !important;
	}
</style>
