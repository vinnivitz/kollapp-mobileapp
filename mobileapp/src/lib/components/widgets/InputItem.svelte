<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { Colors } from '$lib/models/ui';

	let {
		color,
		icon,
		label,
		name,
		type = 'text',
		value,
		helperText,
		inputIcon,
		inputIconClick,
		change
	}: {
		label: string;
		name: string;
		color?: Colors | undefined;
		icon?: string;
		type?:
			| 'number'
			| 'search'
			| 'text'
			| 'tel'
			| 'url'
			| 'email'
			| 'date'
			| 'time'
			| 'datetime-local'
			| 'month'
			| 'password'
			| 'week'
			| undefined;
		helperText?: string;
		value?: string | number | null | undefined;
		inputIcon?: string;
		inputIconClick?: () => void | Promise<void>;
		change?: (value: string) => void;
	} = $props();
</script>

<CustomItem {color} iconStart={icon} iconEnd={inputIcon} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{name}
		{label}
		{type}
		{value}
		helper-text={helperText}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>
