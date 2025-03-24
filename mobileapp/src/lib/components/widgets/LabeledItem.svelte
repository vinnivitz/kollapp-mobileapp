<script lang="ts">
	import type { UserRole } from '$lib/models/api';
	import type { Colors } from '$lib/models/ui';

	import CustomItem from '$lib/components/widgets/CustomItem.svelte';

	type Properties = {
		label: string;
		accessible?: UserRole[];
		card?: boolean;
		color?: Colors | undefined;
		icon?: string;
		searchable?: string;
		transparent?: boolean;
	} & (
		| { searchable: string; click: () => Promise<void> | void }
		| { searchable?: string; click?: () => Promise<void> | void }
	);

	let { accessible, card, click, color = 'light', icon, label, searchable, transparent = false }: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;
	void accessible;

	const labelColor = $derived(color === 'light' || color === 'white' ? 'dark' : 'white');
</script>

<CustomItem {click} {card} {color} {transparent} iconStart={icon}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
