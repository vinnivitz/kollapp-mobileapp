<script lang="ts">
	import { type Colors } from '$lib/models/ui';

	type Properties = {
		badge?: string;
		badgeColor?: Colors;
		classList?: string;
		color?: Colors | undefined;
		disabled?: boolean;
		expand?: 'block' | 'full' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		icon?: string;
		iconPosition?: 'end' | 'start';
		iconSize?: 'large' | 'small' | undefined;
		label?: string;
		labelColor?: Colors;
		readonly?: boolean;
		searchable?: string;
		shape?: 'round' | undefined;
		size?: 'default' | 'large' | 'small' | undefined;
		type?: 'button' | 'reset' | 'submit';
		click?: (event?: MouseEvent) => void;
	} & ({ type: 'submit'; click?: never } | { type?: 'button' | 'reset'; click: (event?: MouseEvent) => void }) &
		({ icon: string; label?: string } | { label: string; icon?: string });

	let {
		badge,
		badgeColor = 'danger',
		classList,
		click,
		color = 'secondary',
		disabled,
		expand,
		fill,
		icon,
		iconPosition = 'start',
		iconSize,
		label,
		labelColor,
		readonly,
		searchable,
		shape,
		size,
		type
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;

	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

<ion-button
	onkeydown={(_event) => _event.key === 'Enter' && click?.()}
	style={`pointer-events: ${readonly ? 'none' : 'auto'};`}
	{shape}
	{color}
	{expand}
	{fill}
	class={classList}
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
		<ion-text color={labelColor} class={fontWeight}>
			{label}
		</ion-text>
	{/if}
	{#if badge}
		{@render badgeIcon()}
	{/if}
{/snippet}

{#snippet startIcon()}
	<ion-icon slot="start" color={labelColor} {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}

{#snippet endIcon()}
	<ion-icon slot="end" color={labelColor} {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}

{#snippet iconOnly()}
	<ion-icon slot="icon-only" color={labelColor} {icon} size={size === 'large' ? 'large' : iconSize}></ion-icon>
{/snippet}

{#snippet badgeIcon()}
	<div class="absolute top-1 right-1">
		<ion-badge color={badgeColor}>
			{badge}
		</ion-badge>
	</div>
{/snippet}
