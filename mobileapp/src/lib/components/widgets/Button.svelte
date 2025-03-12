<script lang="ts">
	import { type Colors, Layout } from '$lib/models/ui';
	import { layoutStore } from '$lib/stores';

	type Properties = {
		classProp?: string;
		click?: (event?: MouseEvent) => void | Promise<void>;
		color?: Colors | undefined;
		disabled?: boolean;
		expand?: 'full' | 'block' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		icon?: string;
		iconPosition?: 'end' | 'start';
		iconSize?: 'small' | 'large' | undefined;
		id?: string;
		label?: string;
		size?: 'default' | 'small' | 'large' | undefined;
		type?: 'button' | 'reset' | 'submit';
	} & (
		| { click?: never; type: 'submit' }
		| { click: (event?: MouseEvent) => void | Promise<void>; type?: 'button' | 'reset' }
	) &
		({ icon?: string; label: string } | { icon: string; label?: string });

	let {
		classProp,
		click,
		color = 'secondary',
		disabled,
		expand,
		fill,
		icon,
		iconPosition = 'start',
		iconSize = 'small',
		id,
		label,
		size,
		type
	}: Properties = $props();

	const isModernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const shape = $derived(isPlayfulLayout ? 'round' : undefined);
	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<ion-button
	{id}
	{color}
	{expand}
	{fill}
	class={classProp}
	class:squared={isModernLayout}
	{size}
	{shape}
	{type}
	{disabled}
	onclick={(event) => click?.(event)}
	role="button"
	tabindex="0"
>
	{@render content()}
</ion-button>

{#snippet content()}
	{#if icon}
		{#if label}
			{#if iconPosition === 'start'}
				{@render startIcon()}
			{:else}
				{@render endIcon()}
			{/if}
		{:else}
			{@render iconOnly()}
		{/if}
	{/if}
	{#if label}
		<ion-text class={fontWeight}>
			{label}
		</ion-text>
	{/if}
{/snippet}

{#snippet startIcon()}
	<ion-icon slot="start" {icon} size={iconSize}></ion-icon>
{/snippet}

{#snippet endIcon()}
	<ion-icon slot="end" {icon} size={iconSize}></ion-icon>
{/snippet}

{#snippet iconOnly()}
	<ion-icon slot="icon-only" {icon} size={iconSize}></ion-icon>
{/snippet}

<style lang="postcss">
	.squared {
		--border-radius: 0;
	}
</style>
