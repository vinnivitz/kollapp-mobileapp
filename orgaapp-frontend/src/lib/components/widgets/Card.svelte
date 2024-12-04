<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		children,
		color
	}: { title?: string; subtitle?: string; children?: Snippet; color?: string } = $props();
</script>

<div>
	
</div>
<ion-card {color}>
	{#if title || subtitle}
		<ion-card-header>
			<ion-card-title>{title}</ion-card-title>
			{#if subtitle}
				<ion-card-subtitle>{subtitle}</ion-card-subtitle>
			{/if}
		</ion-card-header>
	{/if}
	{#if children}
		<ion-card-content>
			{@render children()}
		</ion-card-content>
	{/if}
</ion-card>
