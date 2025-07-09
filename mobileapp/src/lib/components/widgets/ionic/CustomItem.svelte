<script lang="ts">
	import type { Colors, ItemSlidingOption } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import { clickOutside } from '$lib/utility';

	type Properties = {
		children: Snippet;
		card?: boolean;
		classList?: string;
		color?: Colors | undefined;
		disabled?: boolean;
		icon?: string;
		iconColor?: Colors;
		iconEnd?: string;
		id?: string;
		note?: string;
		searchable?: string;
		slidingOptions?: ItemSlidingOption[];
		transparent?: boolean;
		clicked?: () => void;
		iconClick?: () => void;
	};

	let {
		card,
		children,
		classList,
		clicked,
		color = 'light',
		disabled,
		icon,
		iconClick,
		iconColor = color === 'light' || color === 'white' ? 'medium' : 'white',
		iconEnd,
		id,
		note,
		searchable,
		slidingOptions,
		transparent
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;

	let ionItemSlidingElement = $state<HTMLIonItemSlidingElement | undefined>();
</script>

{#if slidingOptions}
	<ion-item-sliding bind:this={ionItemSlidingElement} use:clickOutside onblur={ionItemSlidingElement?.close}>
		{@render item()}
		<ion-item-options slot="end">
			{#each slidingOptions as option (option.icon)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<ion-item-option color={option.color} onclick={() => option.handler()}>
					<ion-icon slot="icon-only" icon={option.icon}></ion-icon>
				</ion-item-option>
			{/each}
		</ion-item-options>
	</ion-item-sliding>
{:else}
	{@render item()}
{/if}

{#snippet item()}
	<ion-item
		onkeydown={(_event) => _event.key === 'Enter' && clicked?.()}
		{disabled}
		{id}
		data-card={card}
		button={!!clicked}
		role="button"
		tabindex="0"
		{color}
		detail={!!(clicked || slidingOptions)}
		data-transparent={transparent}
		onclick={() => (slidingOptions ? ionItemSlidingElement?.open('end') : clicked?.())}
		class={classList}
		style="--ion-color-shade: var(--border-color) !important;"
	>
		{#if icon}
			<ion-icon {icon} slot="start" color={iconColor}></ion-icon>
		{/if}
		{#if note}
			<ion-note slot="end">{note}</ion-note>
		{/if}
		{#if iconEnd}
			<ion-button
				onkeydown={(_event) => _event.key === 'Enter' && clicked?.()}
				role="button"
				tabindex="0"
				class="ms-0"
				fill="clear"
				slot="end"
				onclick={iconClick}
			>
				<ion-icon icon={iconEnd} color="secondary" slot="icon-only" size="large"></ion-icon>
			</ion-button>
		{/if}
		{@render children()}
	</ion-item>
{/snippet}

<style>
	ion-item[data-card='true']::part(native) {
		background-color: var(--ion-background-color-step-100);
	}

	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
