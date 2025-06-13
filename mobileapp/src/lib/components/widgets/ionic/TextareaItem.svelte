<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		name: string;
		color?: Colors;
		cols?: number;
		disabled?: boolean;
		icon?: string;
		iconEnd?: string;
		maxlength?: number;
		placeholder?: string;
		value?: string;
		change?: (value: string) => void;
		inputIconClick?: () => void;
	};
	let {
		change,
		color,
		cols = 3,
		disabled = false,
		icon,
		iconEnd,
		inputIconClick,
		label,
		maxlength,
		name,
		placeholder,
		value
	}: Properties = $props();
</script>

<CustomItem {color} {icon} {iconEnd} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-textarea
		{name}
		{label}
		{placeholder}
		{disabled}
		label-placement="floating"
		counter={!!maxlength}
		{maxlength}
		auto-grow
		color="secondary"
		{cols}
		{value}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	></ion-textarea>
</CustomItem>

<style>
	ion-textarea {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
