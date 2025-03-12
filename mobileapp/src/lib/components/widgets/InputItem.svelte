<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { Colors } from '$lib/models/ui';

	type InputType = 'number' | 'text' | 'email' | 'date' | 'password';

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
		change,
		maxlength
	}: {
		label: string;
		name: string;
		color?: Colors | undefined;
		icon?: string;
		type?: InputType | undefined;
		helperText?: string;
		value?: string | number | null | undefined;
		inputIcon?: string;
		inputIconClick?: () => void | Promise<void>;
		change?: (value: string) => void;
		maxlength?: number;
	} = $props();
</script>

<CustomItem {color} iconStart={icon} iconEnd={inputIcon} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{maxlength}
		{name}
		{label}
		{type}
		{value}
		helper-text={helperText}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>
