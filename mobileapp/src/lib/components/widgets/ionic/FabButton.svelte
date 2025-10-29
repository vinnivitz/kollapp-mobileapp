<script lang="ts">
	import type { Colors, FabButtonButtons } from '$lib/models/ui';

	import { clickOutside } from '$lib/utility';

	type Properties = {
		icon: string;
		label: string;
		buttons?: FabButtonButtons[];
		classList?: string;
		color?: Colors;
		horizontal?: 'center' | 'end' | 'start';
		id?: string;
		searchable?: string | unknown;
		vertical?: 'bottom' | 'center' | 'top';
		clicked?: () => void;
	};

	let {
		buttons = [],
		classList = '',
		clicked,
		color = 'secondary',
		horizontal = 'end',
		icon,
		id,
		label,
		searchable,
		vertical = 'bottom'
	}: Properties = $props();

	let fabButtonElement = $state<HTMLIonFabElement>();

	// workaround to avoid reference linting error
	void searchable;
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-fab
	bind:this={fabButtonElement}
	class={`fixed ${classList}`}
	{vertical}
	{horizontal}
	{id}
	aria-label={label}
	use:clickOutside
	on:blur={fabButtonElement?.close}
>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-fab-button
		role="button"
		tabindex="0"
		on:keydown={(_event) => _event.key === 'Enter' && clicked?.()}
		{color}
		on:click={clicked}
		translucent
	>
		<ion-icon {icon}></ion-icon>
	</ion-fab-button>
	{#if buttons.length > 0}
		<ion-fab-list side="top">
			{#each buttons as button (button.label)}
				<!-- svelte-ignore event_directive_deprecated -->
				<ion-fab-button
					role="button"
					tabindex="0"
					on:keydown={(_event) => _event.key === 'Enter' && button.handler()}
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
