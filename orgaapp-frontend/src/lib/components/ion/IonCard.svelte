<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		children,
		color
	}: { title: string; subtitle?: string; children: Snippet; color?: string } = $props();
</script>

<ion-card {color}>
	<ion-card-header>
		<ion-card-title>{title}</ion-card-title>
		{#if subtitle}
			<ion-card-subtitle>{subtitle}</ion-card-subtitle>
		{/if}
	</ion-card-header>
	<ion-card-content>
		{@render children?.()}
	</ion-card-content>
</ion-card>
<ion-ripple-effect></ion-ripple-effect>
