<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	import CustomItem from '$lib/components/widgets/CustomItem.svelte';

	type InputType = 'date' | 'email' | 'number' | 'password' | 'text';

	type Properties = {
		label: string;
		name: string;
		card?: boolean;
		color?: Colors;
		disabled?: boolean;
		helperText?: string;
		icon?: string;
		inputIcon?: string;
		maxlength?: number;
		type?: InputType;
		value?: null | number | string;
		change?: (value: string) => void;
		inputIconClick?: () => void;
	};

	let {
		card,
		change,
		color,
		disabled,
		helperText,
		icon,
		inputIcon,
		inputIconClick,
		label,
		maxlength,
		name,
		type = 'text',
		value
	}: Properties = $props();
</script>

<CustomItem {card} {color} iconStart={icon} iconEnd={inputIcon} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		label-placement="floating"
		{maxlength}
		counter={!!maxlength}
		{name}
		{label}
		type={type === 'date' ? 'text' : type}
		{value}
		{disabled}
		helper-text={helperText}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>

<style>
	ion-input {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
