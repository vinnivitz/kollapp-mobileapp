<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { OrganizationRole } from '@kollapp/api-types';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';

	type Properties = {
		label: string;
		accessible?: OrganizationRole;
		card?: boolean;
		classList?: string;
		color?: Colors | undefined;
		icon?: string;
		indexed?: string;
		transparent?: boolean;
	} & ({ indexed: string; clicked: () => void } | { indexed?: string; clicked?: () => void });

	let {
		accessible,
		card,
		classList = '',
		clicked,
		color = 'light',
		icon,
		indexed,
		label,
		transparent = false
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void accessible;

	const labelColor = $derived(color === 'light' || color === 'white' ? 'dark' : 'white');
</script>

<CustomItem {clicked} {card} {color} {transparent} {icon} {classList}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
