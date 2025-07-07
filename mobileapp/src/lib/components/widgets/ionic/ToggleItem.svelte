<script lang="ts">
	import CustomItem from './CustomItem.svelte';

	type Properties = {
		icon: string;
		label: string;
		checked?: boolean;
		disabled?: boolean;
		element?: HTMLIonToggleElement | undefined;
		searchable?: string;
		change: (value?: boolean) => void;
	};

	let { change, checked, disabled, element, icon, label, searchable }: Properties = $props();
	void element;
	void searchable;
	void label;
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
