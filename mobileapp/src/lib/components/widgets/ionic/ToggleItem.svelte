<script lang="ts">
	import CustomItem from './CustomItem.svelte';

	type Properties = {
		label: string;
		card?: boolean;
		checked?: boolean;
		disabled?: boolean;
		element?: HTMLIonToggleElement | undefined;
		icon?: string;
		searchable?: string;
		change: (value?: boolean) => void;
	};

	let { card, change, checked, disabled, element, icon, label, searchable }: Properties = $props();
	void element;
	void searchable;
	void label;
</script>

<CustomItem {icon} {card}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-toggle
		{disabled}
		bind:this={element}
		enable-on-off-labels
		on:ionChange={(value) => change(value.detail.checked)}
		{checked}
		class="ms-4"
		justify="space-between">{label}</ion-toggle
	>
</CustomItem>
