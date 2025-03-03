<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { Colors } from '$lib/models/ui';

	let {
		color,
		iconSrc,
		label,
		name,
		type = 'text',
		value,
		change
	}: {
		label: string;
		name: string;
		color?: Colors | undefined;
		iconSrc?: string;
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
		value?: string | number | null | undefined;
		change?: (value: string) => void;
	} = $props();
</script>

<CustomItem {color} {iconSrc}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{name}
		{label}
		{type}
		{value}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	></ion-input>
</CustomItem>
