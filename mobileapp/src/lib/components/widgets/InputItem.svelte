<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { Colors } from '$lib/models/ui';

	type InputType = 'date' | 'email' | 'number' | 'password' | 'text';

	type Properties = {
		change?: (value: string) => void;
		color?: Colors;
		helperText?: string;
		icon?: string;
		inputIcon?: string;
		inputIconClick?: () => void | Promise<void>;
		label: string;
		maxlength?: number;
		name: string;
		type?: InputType;
		value?: string | number | null;
	};

	let {
		change,
		color,
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

<CustomItem {color} iconStart={icon} iconEnd={inputIcon} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{maxlength}
		counter={!!maxlength}
		{name}
		{label}
		{type}
		{value}
		helper-text={helperText}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>
