<script lang="ts">
	import CustomItem from './CustomItem.svelte';

	type Properties = {
		icon: string;
		label: string;
		disabled?: boolean;
		element?: HTMLIonToggleElement | undefined;
		searchable?: string;
		value?: boolean;
		change: (value?: boolean) => void;
	};

	let { change, disabled, element, icon, label, searchable, value }: Properties = $props();
	void element;
	void searchable;
	void label;

	let checked = $state(value);
</script>

<CustomItem {icon}>
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
