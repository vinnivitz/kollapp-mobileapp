<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		icon: string;
		title: string;
		color?: Colors;
		subtitle?: string;
	};

	let { color = 'primary', icon, subtitle, title }: Properties = $props();
</script>

<div class="mt-6 mb-2 flex items-center gap-3 px-4" style="padding-left: 12px;">
	<div
		class="flex h-8 w-8 items-center justify-center rounded-full"
		style="background: color-mix(in srgb, var(--ion-color-{color}) 15%, transparent);"
	>
		<ion-icon {icon} {color} class="text-lg"></ion-icon>
	</div>
	<div class="flex flex-col">
		<ion-text class="text-sm font-bold tracking-wide uppercase" {color}>{title}</ion-text>
		{#if subtitle}
			<ion-note class="text-xs">{subtitle}</ion-note>
		{/if}
	</div>
	<div class="ml-2 h-px flex-1 bg-(--ion-color-light)"></div>
</div>
