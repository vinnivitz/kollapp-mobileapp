<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { InputInputEventDetail } from '@ionic/core';

	import { onMount } from 'svelte';

	import { CustomItem } from '$lib/components/core/form';

	type InputType = 'date' | 'email' | 'number' | 'password' | 'text';

	type Properties = {
		label: string;
		classList?: string;
		color?: Colors;
		disabled?: boolean;
		helperText?: string;
		hidden?: boolean;
		icon?: string;
		inputIcon?: string;
		inputmode?: 'decimal' | 'email' | 'none' | 'numeric' | 'search' | 'tel' | 'text' | 'url';
		maxlength?: number;
		pattern?: string;
		readonly?: boolean;
		type?: InputType;
		uppercase?: boolean;
		inputElement?: (element: HTMLIonInputElement) => void;
		inputIconClicked?: () => void;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: number | string; changed?: (value: string) => void }
	);

	let {
		changed,
		classList = '',
		color,
		disabled,
		helperText,
		hidden = false,
		icon,
		inputElement,
		inputIcon,
		inputIconClicked,
		inputmode = 'text',
		label,
		maxlength,
		name,
		pattern,
		readonly,
		type = 'text',
		uppercase,
		value
	}: Properties = $props();

	let element = $state<HTMLIonInputElement>();
	let isFocused = $state<boolean>(false);

	$effect(() => {
		if (element) inputElement?.(element);
	});

	onMount(async () => {
		const nativeElement = await element?.getInputElement();
		if (nativeElement && uppercase) {
			nativeElement.style.textTransform = 'uppercase';
		}
	});
</script>

<CustomItem
	{color}
	{icon}
	iconColor={isFocused ? 'secondary' : undefined}
	iconEnd={inputIcon}
	iconClicked={inputIconClicked}
	{name}
	{hidden}
>
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
		class={classList}
		type={type === 'date' ? 'text' : type}
		{value}
		{disabled}
		helper-text={helperText}
		onionFocus={() => (isFocused = true)}
		onionBlur={() => (isFocused = false)}
		onionInput={(event: CustomEvent<InputInputEventDetail>) => changed?.(event.detail.value || '')}
	>
	</ion-input>
</CustomItem>

<style>
	ion-input {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
