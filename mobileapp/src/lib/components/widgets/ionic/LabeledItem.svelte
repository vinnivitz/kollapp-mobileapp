<script lang="ts">
	import type { OrganizationRole } from '$lib/models/api';
	import type { Colors } from '$lib/models/ui';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

	type Properties = {
		label: string;
		accessible?: OrganizationRole[];
		card?: boolean;
		classList?: string;
		color?: Colors | undefined;
		icon?: string;
		searchable?: string;
		transparent?: boolean;
	} & ({ searchable: string; clicked: () => void } | { searchable?: string; clicked?: () => void });

	let {
		accessible,
		card,
		classList = '',
		clicked,
		color = 'light',
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

<CustomItem {clicked} {card} {color} {transparent} {icon} {classList}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
