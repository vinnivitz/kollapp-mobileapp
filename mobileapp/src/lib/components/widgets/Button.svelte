<script lang="ts">
	import { Layout, type Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/stores';

	let {
		click,
		label,
		classProp,
		color = 'secondary',
		expand,
		fill,
		size,
		icon,
		iconSize = 'small',
		iconPosition = 'start',
		type,
		disabled
	}: {
		click?: (event?: MouseEvent) => void | Promise<void>;
		label?: string;
		color?: Colors | undefined;
		expand?: 'full' | 'block' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		classProp?: string;
		size?: 'default' | 'small' | 'large' | undefined;
		icon?: string;
		iconSize?: 'small' | 'large' | undefined;
		iconPosition?: 'start' | 'end';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
	} & (
		| { type: 'submit'; click?: never }
		| { type?: 'button' | 'reset'; click: (event?: MouseEvent) => void | Promise<void> }
	) &
		({ label: string; icon?: string } | { icon: string; label?: string }) = $props();

	const isMondernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const shape = $derived(isPlayfulLayout ? 'round' : undefined);
	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<ion-button
	{color}
	{expand}
	{fill}
	class={classProp}
	class:squared={isMondernLayout}
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
