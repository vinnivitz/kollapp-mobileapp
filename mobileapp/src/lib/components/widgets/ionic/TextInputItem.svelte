<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

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
		inputmode?: 'decimal' | 'email' | 'none' | 'numeric' | 'search' | 'tel' | 'text' | 'url' | undefined;
		maxlength?: number;
		pattern?: string;
		readonly?: boolean;
		type?: InputType;
		value?: null | number | string;
		changed?: (value: string) => void;
		clicked?: () => void;
		inputElement?: (element: HTMLIonInputElement) => void;
		inputIconClick?: () => void;
	};

	let {
		card,
		changed,
		clicked,
		color,
		disabled,
		helperText,
		icon,
		inputElement,
		inputIcon,
		inputIconClick,
		inputmode = 'text',
		label,
		maxlength,
		name,
		pattern,
		readonly,
		type = 'text',
		value
	}: Properties = $props();

	let element = $state<HTMLIonInputElement>();

	$effect(() => {
		if (element) inputElement?.(element);
	});
</script>

<CustomItem {card} {color} {icon} iconEnd={inputIcon} {clicked} iconClick={inputIconClick}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{inputmode}
		bind:this={element}
		{readonly}
		{pattern}
		label-placement="floating"
		{maxlength}
		counter={!!maxlength}
		{name}
		{label}
		type={type === 'date' ? 'text' : type}
		{value}
		{disabled}
		helper-text={helperText}
		on:ionInput={(event) => changed?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>

<style>
	ion-input {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
