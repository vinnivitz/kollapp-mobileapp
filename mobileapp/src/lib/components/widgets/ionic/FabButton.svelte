<script lang="ts">
	import type { Colors, FabButtonButtons } from '$lib/models/ui';

	import { clickOutside } from '$lib/utility';

	type Properties = {
		icon: string;
		label: string;
		buttons?: FabButtonButtons[];
		color?: Colors;
		horizontal?: 'center' | 'end' | 'start';
		id?: string;
		searchable?: string | unknown;
		vertical?: 'bottom' | 'center' | 'top';
		click?: () => void;
	};

	let {
		buttons = [],
		click,
		color = 'secondary',
		horizontal = 'end',
		icon,
		id,
		label,
		searchable,
		vertical = 'bottom'
	}: Properties = $props();

	let fabButtonElement = $state<HTMLIonFabElement | undefined>();

	// workaround to avoid reference linting error
	void searchable;
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-fab
	bind:this={fabButtonElement}
	class="fixed"
	{vertical}
	{horizontal}
	{id}
	aria-label={label}
	use:clickOutside
	on:blur={fabButtonElement?.close}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-fab-button {color} on:click={click} translucent>
		<ion-icon {icon}></ion-icon>
	</ion-fab-button>
	{#if buttons.length > 0}
		<ion-fab-list side="top">
			{#each buttons as button (button.label)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore event_directive_deprecated -->
				<ion-fab-button
					color={button.color ?? 'secondary'}
					on:click={button.handler}
					aria-label={button.label}
					translucent
				>
					<ion-icon icon={button.icon}></ion-icon>
				</ion-fab-button>
			{/each}
		</ion-fab-list>
	{/if}
</ion-fab>
