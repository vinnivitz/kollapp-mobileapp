<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		icon: string;
		label: number | string;
		bold?: boolean;
		classList?: string;
		color?: Colors;
		iconColor?: Colors;
		size?: '2xl' | 'lg' | 'normal' | 'sm' | 'xl' | 'xs';
	};

	let { bold = false, classList = '', color = 'medium', icon, iconColor, label, size = 'sm' }: Properties = $props();
	const computedIconColor = $derived(iconColor ?? color);
</script>

<div class={`flex items-center justify-center gap-1 text-${size} ${classList}`} class:font-bold={bold}>
	<ion-icon {icon} color={computedIconColor}></ion-icon>
	<ion-text class="truncate" {color}>{label}</ion-text>
</div>
