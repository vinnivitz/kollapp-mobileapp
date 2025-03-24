<script lang="ts">
	import { type Colors } from '$lib/models/ui';

	type Properties = {
		classProp?: string;
		color?: Colors | undefined;
		disabled?: boolean;
		expand?: 'block' | 'full' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		icon?: string;
		iconPosition?: 'end' | 'start';
		iconSize?: 'large' | 'small' | undefined;
		label?: string;
		size?: 'default' | 'large' | 'small' | undefined;
		type?: 'button' | 'reset' | 'submit';
		click?: (event?: MouseEvent) => Promise<void> | void;
	} & (
		| { type: 'submit'; click?: never }
		| { type?: 'button' | 'reset'; click: (event?: MouseEvent) => Promise<void> | void }
	) &
		({ icon: string; label?: string } | { label: string; icon?: string });

	let {
		classProp,
		click,
		color = 'secondary',
		disabled,
		expand,
		fill,
		icon,
		iconPosition = 'start',
		iconSize,
		label,
		size,
		type
	}: Properties = $props();

	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<ion-button
	{color}
	{expand}
	{fill}
	class={classProp}
	{size}
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
	<ion-icon slot="start" {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}

{#snippet endIcon()}
	<ion-icon slot="end" {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}

{#snippet iconOnly()}
	<ion-icon slot="icon-only" {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}
