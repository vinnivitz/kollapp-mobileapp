<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { OrganizationRole } from '@kollapp/api-types';

	import type { RouteId } from '$app/types';

	import { CustomItem } from '$lib/components/core/form';

	type Properties = {
		label: string;
		accessible?: OrganizationRole;
		ariaLabel?: string;
		badge?: string;
		classList?: string;
		color?: Colors;
		icon?: string;
		indexed?: RouteId;
		tourId?: string;
		transparent?: boolean;
	} & ({ indexed: RouteId; clicked: () => void } | { indexed?: RouteId; clicked?: () => void });

	let {
		accessible,
		ariaLabel,
		badge,
		classList = '',
		clicked,
		color = 'light',
		icon,
		indexed,
		label,
		tourId,
		transparent = false
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void accessible;

	const labelColor = $derived(color === 'light' || color === 'white' ? 'dark' : 'white');
	const computedAriaLabel = $derived(ariaLabel ?? label);
</script>

<CustomItem {clicked} {color} {transparent} {icon} {classList} {badge} {tourId} ariaLabel={computedAriaLabel}>
	{#if label}
		<ion-label class="ms-4" color={labelColor}>{label}</ion-label>
	{/if}
</CustomItem>
