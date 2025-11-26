<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { InputInputEventDetail } from '@ionic/core';

	import { onMount } from 'svelte';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

	type InputType = 'date' | 'email' | 'number' | 'password' | 'text';

	type Properties = {
		label: string;
		name: string;
		card?: boolean;
		classList?: string;
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
		uppercase?: boolean;
		value?: null | number | string;
		changed?: (value: string) => void;
		clicked?: () => void;
		inputElement?: (element: HTMLIonInputElement) => void;
		inputIconClicked?: () => void;
	};

	let {
		card,
		changed,
		classList,
		clicked,
		color,
		disabled,
		helperText,
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

<CustomItem {card} {color} {icon} iconEnd={inputIcon} {clicked} iconClick={inputIconClicked}>
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
