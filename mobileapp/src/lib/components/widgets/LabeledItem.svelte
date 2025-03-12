<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { UserRole } from '$lib/models/api';
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: UserRole[];
		button?: boolean;
		color?: Colors | undefined;
		detail?: boolean;
		icon?: string;
		label: string;
		searchable?: string;
		transparent?: boolean;
	} & (
		| { click: () => void | Promise<void>; searchable: string }
		| { click?: () => void | Promise<void>; searchable?: string }
	);

	let {
		accessible,
		click,
		color = 'light',
		detail = true,
		icon,
		label,
		searchable,
		transparent = false
	}: Properties = $props();

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
