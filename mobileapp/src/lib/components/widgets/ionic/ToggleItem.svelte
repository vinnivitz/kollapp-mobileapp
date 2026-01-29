<script lang="ts">
	import type { ToggleChangeEventDetail } from '@ionic/core';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		card?: boolean;
		checked?: boolean;
		classList?: string;
		disabled?: boolean;
		element?: HTMLIonToggleElement;
		hidden?: boolean;
		icon?: string;
		indexed?: string;
		changed: (value?: boolean) => void;
	};

	let {
		card,
		changed,
		checked,
		classList,
		disabled,
		element,
		hidden = false,
		icon,
		indexed,
		label
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void element;
</script>

<CustomItem {icon} {card} {classList} {hidden} ariaLabel={label}>
	<ion-toggle
		{disabled}
		bind:this={element}
		enable-on-off-labels
		aria-label={label}
		onionChange={(value: CustomEvent<ToggleChangeEventDetail>) => changed(value.detail.checked)}
		{checked}
		class="ms-4"
		justify="space-between">{label}</ion-toggle
	>
</CustomItem>
