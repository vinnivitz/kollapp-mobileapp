<script lang="ts">
	import type { ToggleChangeEventDetail } from '@ionic/core';

	import { CustomItem } from '$lib/components/core/form';

	type Properties = {
		label: string;
		checked?: boolean;
		classList?: string;
		disabled?: boolean;
		element?: HTMLIonToggleElement;
		hidden?: boolean;
		icon?: string;
		indexed?: string;
		changed: (value?: boolean) => void;
	};

	let { changed, checked, classList, disabled, element, hidden = false, icon, indexed, label }: Properties = $props();

	// workaround to avoid reference linting error
	$effect(() => {
		void indexed;
		void element;
	});
</script>

<CustomItem {icon} {classList} {hidden} ariaLabel={label}>
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
