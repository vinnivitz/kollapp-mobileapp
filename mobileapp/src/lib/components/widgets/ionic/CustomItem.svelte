<script lang="ts">
	import type { Colors, ItemSlidingOption } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import LazyRender from '$lib/components/utility/LazyRender.svelte';
	import { clickOutside } from '$lib/utility';

	type Properties = {
		children: Snippet;
		ariaLabel?: string;
		badge?: string;
		badgeColor?: Colors;
		badgeEnd?: string;
		card?: boolean;
		classList?: string;
		color?: Colors;
		disabled?: boolean;
		element?: HTMLDivElement;
		hidden?: boolean;
		icon?: string;
		iconColor?: Colors;
		iconEnd?: string;
		indexed?: string;
		indexLabel?: string;
		lazy?: boolean;
		name?: string;
		note?: string;
		readonly?: boolean;
		slidingOptions?: ItemSlidingOption[];
		transparent?: boolean;
		clicked?: () => void;
		iconClicked?: () => void;
	};

	let {
		ariaLabel,
		badge,
		badgeColor = 'danger',
		badgeEnd,
		card,
		children,
		classList = '',
		clicked,
		color = 'light',
		disabled,
		element = $bindable(),
		hidden = false,
		icon,
		iconClicked,
		iconColor = color === 'light' || color === 'white' ? 'medium' : 'white',
		iconEnd,
		indexed,
		indexLabel,
		lazy = false,
		name,
		note,
		readonly,
		slidingOptions,
		transparent
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;

	let ionItemSlidingElement = $state<HTMLIonItemSlidingElement>();

	readonly = readonly ?? disabled;
</script>

{#if lazy}
	<LazyRender>
		{@render customItem()}
	</LazyRender>
{:else}
	{@render customItem()}
{/if}

{#snippet customItem()}
	{#if slidingOptions}
		<ion-item-sliding
			bind:this={ionItemSlidingElement}
			use:clickOutside={() => ionItemSlidingElement?.close()}
			class:hidden
		>
			{@render item()}
			<ion-item-options slot="end">
				{#each slidingOptions as option (option.icon)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<ion-item-option
						color={option.color}
						aria-label={option.label}
						onclick={() => {
							option.handler();
							ionItemSlidingElement?.close();
						}}
					>
						{#if option.label}
							<div class="flex min-w-12 flex-col items-center justify-center">
								<ion-icon class="text-2xl" icon={option.icon}></ion-icon>
								<ion-text class="text-xs">{option.label}</ion-text>
							</div>
						{:else}
							<ion-icon slot="icon-only" icon={option.icon}></ion-icon>
						{/if}
					</ion-item-option>
				{/each}
			</ion-item-options>
		</ion-item-sliding>
	{:else}
		<div class="contents" class:hidden>
			{@render item()}
		</div>
	{/if}
{/snippet}

{#snippet item()}
	<div class="relative contents" data-name={name} bind:this={element}>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ion-item
			data-name={name}
			onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && !readonly && clicked?.()}
			{disabled}
			id={indexLabel}
			data-card={card}
			button={!!clicked && !readonly}
			role={clicked && !readonly ? 'button' : undefined}
			aria-label={ariaLabel}
			tabindex={clicked && !readonly ? 0 : undefined}
			{color}
			detail={!!((clicked && !readonly) || slidingOptions) && !iconEnd}
			data-transparent={transparent}
			onclick={() => (slidingOptions ? ionItemSlidingElement?.open('end') : !readonly && clicked?.())}
			class={classList}
			style="--ion-color-shade: var(--border-color) !important;"
		>
			{#if icon}
				<ion-icon {icon} slot="start" color={iconColor} aria-hidden="true"></ion-icon>
			{/if}
			{#if note}
				<ion-note slot="end">{note}</ion-note>
			{/if}
			{#if iconEnd}
				<ion-button
					onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && !readonly && clicked?.()}
					role="button"
					tabindex="0"
					class="ms-0"
					fill="clear"
					slot="end"
					aria-label={ariaLabel}
					onclick={iconClicked}
				>
					<ion-icon icon={iconEnd} color="secondary" slot="icon-only" size="large" aria-hidden="true"></ion-icon>
				</ion-button>
			{/if}
			{#if badgeEnd}
				<ion-badge slot="end" color={badgeColor} class="opacity-90">
					{badgeEnd}
				</ion-badge>
			{/if}
			{@render children()}
		</ion-item>
		{#if badge}
			{@render badgeStartIcon()}
		{:else}
			<!-- Workaround to show item separator -->
			<div></div>
		{/if}
	</div>
{/snippet}

{#snippet badgeStartIcon()}
	<div class="absolute top-1 left-1 opacity-90" style="z-index: 90;">
		<ion-badge color={badgeColor}>
			{badge}
		</ion-badge>
	</div>
{/snippet}

<style>
	ion-item[data-card='true']::part(native) {
		background-color: var(--ion-background-color-step-100);
	}

	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
