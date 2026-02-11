<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		icon: string;
		label: number | string;
		align?: 'center' | 'end' | 'start';
		bold?: boolean;
		classList?: string;
		color?: Colors;
		iconColor?: Colors;
		size?: '2xl' | 'lg' | 'normal' | 'sm' | 'xl' | 'xs';
	};

	let {
		align = 'center',
		bold = false,
		classList = '',
		color = 'medium',
		icon,
		iconColor,
		label,
		size = 'sm'
	}: Properties = $props();
	const computedIconColor = $derived(iconColor ?? color);
</script>

<div class={`flex min-w-0 items-center justify-${align} gap-1 text-${size} ${classList}`} class:font-bold={bold}>
	<ion-icon {icon} color={computedIconColor} class="shrink-0"></ion-icon>
	<ion-text class="block truncate" {color}>{label}</ion-text>
</div>
