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

	const justifyMap: Record<string, string> = {
		center: 'justify-center',
		end: 'justify-end',
		start: 'justify-start'
	};

	const sizeMap: Record<string, string> = {
		'2xl': 'text-2xl',
		lg: 'text-lg',
		normal: 'text-base',
		sm: 'text-sm',
		xl: 'text-xl',
		xs: 'text-xs'
	};
</script>

<div
	class={`flex min-w-0 items-center ${justifyMap[align]} gap-1 ${sizeMap[size]} ${classList}`}
	class:font-bold={bold}
>
	<ion-icon {icon} color={computedIconColor} class="shrink-0"></ion-icon>
	<ion-text class="block truncate" {color}>{label}</ion-text>
</div>
