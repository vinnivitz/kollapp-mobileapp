<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	type Properties = {
		icon: string;
		label: string;
		color?: Colors;
		horizontal?: 'center' | 'end' | 'start';
		id?: string;
		searchable?: string | unknown;
		vertical?: 'bottom' | 'center' | 'top';
		click: () => void;
	};

	let {
		click,
		color = 'secondary',
		horizontal = 'end',
		icon,
		id,
		label,
		searchable,
		vertical = 'bottom'
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;
</script>

<ion-fab class="fixed" {vertical} {horizontal} {id} aria-label={label}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-fab-button {color} on:click={click}>
		<ion-icon {icon}></ion-icon>
	</ion-fab-button>
</ion-fab>
