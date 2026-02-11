<script lang="ts">
	import type { Colors, ItemSlidingOption } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import { LazyRender } from '$lib/components/core/animation';
	import { clickOutside } from '$lib/utility';

	type Properties = {
		children: Snippet;
		ariaLabel?: string;
		badge?: string;
		badgeColor?: Colors;
		badgeEnd?: string;
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
		tourId?: string;
		transparent?: boolean;
		clicked?: () => void;
		iconClicked?: () => void;
	};

	let {
		ariaLabel,
		badge,
		badgeColor = 'danger',
		badgeEnd,
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
		tourId,
		transparent
	}: Properties = $props();

	// workaround to avoid reference linting error
	$effect(() => {
		void indexed;
	});

	let ionItemSlidingElement = $state<HTMLIonItemSlidingElement>();

	const computedReadonly = $derived(readonly ?? disabled);
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
			use:clickOutside={() => void ionItemSlidingElement?.close()}
			class:hidden
		>
			{@render item()}
			<ion-item-options slot="end">
				{#each slidingOptions as option (option.icon)}
					<ion-item-option
						color={option.color}
						aria-label={option.label}
						role="button"
						tabindex={0}
						onclick={() => {
							option.handler();
							void ionItemSlidingElement?.close();
						}}
						onkeydown={(event_: KeyboardEvent) => {
							if (event_.key === 'Enter') {
								option.handler();
								void ionItemSlidingElement?.close();
							}
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
			data-tour={tourId}
			onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && !computedReadonly && clicked?.()}
			{disabled}
			id={indexLabel}
			button={!!clicked && !computedReadonly}
			role={clicked && !computedReadonly ? 'button' : undefined}
			aria-label={ariaLabel}
			tabindex={clicked && !computedReadonly ? 0 : undefined}
			{color}
			detail={!!((clicked && !computedReadonly) || slidingOptions) && !iconEnd}
			data-transparent={transparent}
			onclick={() => (slidingOptions ? ionItemSlidingElement?.open('end') : !computedReadonly && clicked?.())}
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
					onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && !computedReadonly && clicked?.()}
					role="button"
					tabindex="0"
					class="-me-3"
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
	ion-item[data-transparent='true']::part(native) {
		background-color: transparent;
	}
</style>
