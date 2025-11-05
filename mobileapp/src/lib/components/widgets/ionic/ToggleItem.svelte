<script lang="ts">
	import type { ToggleChangeEventDetail } from '@ionic/core';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		card?: boolean;
		checked?: boolean;
		disabled?: boolean;
		element?: HTMLIonToggleElement;
		icon?: string;
		indexed?: string;
		change: (value?: boolean) => void;
	};

	let { card, change, checked, disabled, element, icon, indexed, label }: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void element;
</script>

<CustomItem {icon} {card}>
	<ion-toggle
		{disabled}
		bind:this={element}
		enable-on-off-labels
		onionChange={(value: CustomEvent<ToggleChangeEventDetail>) => change(value.detail.checked)}
		{checked}
		class="ms-4"
		justify="space-between">{label}</ion-toggle
	>
</CustomItem>
