<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { TextareaInputEventDetail } from '@ionic/core';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		name: string;
		card?: boolean;
		color?: Colors;
		disabled?: boolean;
		icon?: string;
		iconEnd?: string;
		maxlength?: number;
		placeholder?: string;
		value?: string;
		change?: (value: string) => void;
		inputIconClicked?: () => void;
	};
	let {
		card,
		change,
		color,
		disabled = false,
		icon,
		iconEnd,
		inputIconClicked,
		label,
		maxlength,
		name,
		placeholder,
		value
	}: Properties = $props();

	function onChange(event: CustomEvent<TextareaInputEventDetail>): void {
		change?.(event.detail.value || '');
	}
</script>

<CustomItem {color} {icon} {iconEnd} iconClick={inputIconClicked} {card}>
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
		{value}
		on:ionInput={onChange}
	></ion-textarea>
</CustomItem>

<style>
	ion-textarea {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
