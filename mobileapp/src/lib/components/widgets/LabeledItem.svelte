<script lang="ts">
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import type { Colors } from '$lib/models/ui';

	let {
		label,
		click,
		detail = false,
		color = 'light',
		iconSrc,
		transparent = false,
		searchable
	}: {
		label: string;
		detail?: boolean;
		color?: Colors | undefined;
		iconSrc?: string;
		transparent?: boolean;
		button?: boolean;
		searchable?: string;
	} & (
		| { searchable: string; click: () => void | Promise<void> }
		| { searchable?: string; click?: () => void | Promise<void> }
	) = $props();

	// workaround to avoid reference linting error
	void searchable;

	const labelColor = $derived(color === 'light' || color === 'white' ? 'dark' : 'white');
</script>

<CustomItem button={!!click} {click} {color} {detail} {transparent} {iconSrc}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
