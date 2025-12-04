<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { TextareaInputEventDetail } from '@ionic/core';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		card?: boolean;
		classList?: string;
		color?: Colors;
		disabled?: boolean;
		icon?: string;
		iconEnd?: string;
		maxlength?: number;
		placeholder?: string;
		readonly?: boolean;
		inputIconClicked?: () => void;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: string; changed?: (value: string) => void }
	);

	let {
		card,
		changed,
		classList = '',
		color,
		disabled = false,
		icon,
		iconEnd,
		inputIconClicked,
		label,
		maxlength,
		name,
		placeholder,
		readonly,
		value
	}: Properties = $props();

	function onChange(event: CustomEvent<TextareaInputEventDetail>): void {
		changed?.(event.detail.value || '');
	}
</script>

<CustomItem {color} {icon} {iconEnd} iconClick={inputIconClicked} {card} {classList}>
	<ion-textarea
		{readonly}
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
		onionInput={onChange}
	></ion-textarea>
</CustomItem>

<style>
	ion-textarea {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
