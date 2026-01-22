<script lang="ts">
	import type { Colors, FabButtonButtons } from '$lib/models/ui';

	import type { RouteId } from '$app/types';

	import { clickOutside } from '$lib/utility';

	type Properties = {
		icon: string;
		buttons?: FabButtonButtons[];
		classList?: string;
		color?: Colors;
		horizontal?: 'center' | 'end' | 'start';
		indexed?: RouteId;
		indexLabel?: string;
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
		indexed,
		indexLabel,
		vertical = 'bottom'
	}: Properties = $props();

	let fabButtonElement = $state<HTMLIonFabElement>();

	// workaround to avoid reference linting error
	void indexed;
</script>

<ion-fab
	bind:this={fabButtonElement}
	class={`fixed ${classList}`}
	{vertical}
	{horizontal}
	id={indexLabel}
	use:clickOutside
	onblur={fabButtonElement?.close}
>
	<ion-fab-button
		role="button"
		tabindex="0"
		onkeydown={(_event: KeyboardEvent) => _event.key === 'Enter' && clicked?.()}
		{color}
		onclick={clicked}
		translucent
	>
		<ion-icon {icon}></ion-icon>
	</ion-fab-button>
	{#if buttons.length > 0}
		<ion-fab-list side="top">
			{#each buttons as button (button.label)}
				<ion-fab-button
					role="button"
					tabindex="0"
					onkeydown={(_event: KeyboardEvent) => _event.key === 'Enter' && button.handler()}
					color={button.color ?? 'secondary'}
					onclick={button.handler}
					aria-label={button.label}
					translucent
				>
					<ion-icon icon={button.icon}></ion-icon>
				</ion-fab-button>
			{/each}
		</ion-fab-list>
	{/if}
</ion-fab>
