<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { UserRole } from '$lib/models/api';
	import type { Colors } from '$lib/models/ui';

	let {
		label,
		click,
		detail = true,
		color = 'light',
		icon,
		transparent = false,
		searchable,
		accessible
	}: {
		label: string;
		detail?: boolean;
		color?: Colors | undefined;
		icon?: string;
		transparent?: boolean;
		button?: boolean;
		searchable?: string;
		accessible?: UserRole[];
	} & (
		| { searchable: string; click: () => void | Promise<void> }
		| { searchable?: string; click?: () => void | Promise<void> }
	) = $props();

	// workaround to avoid reference linting error
	void searchable;
	void accessible;

	const labelColor = $derived(color === 'light' || color === 'white' ? 'dark' : 'white');
</script>

<CustomItem button={!!click} {click} {color} {detail} {transparent} iconStart={icon}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
