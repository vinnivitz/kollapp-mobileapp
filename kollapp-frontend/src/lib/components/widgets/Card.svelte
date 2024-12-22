<script lang="ts">
	import type { PredefinedColors } from '@ionic/core';
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		children,
		color
	}: { title?: string; subtitle?: string; children?: Snippet; color?: PredefinedColors } = $props();
</script>

<div></div>
<ion-card {color}>
	{#if title || subtitle}
		<ion-card-header>
			<ion-card-title class="text-center">{title}</ion-card-title>
			{#if subtitle}
				<ion-card-subtitle>{subtitle}</ion-card-subtitle>
			{/if}
		</ion-card-header>
	{/if}
	{#if children}
		<ion-card-content>
			{@render children?.()}
		</ion-card-content>
	{/if}
</ion-card>
