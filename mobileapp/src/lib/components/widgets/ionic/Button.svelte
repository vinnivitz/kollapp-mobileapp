<script lang="ts">
	import { type Colors } from '$lib/models/ui';

	type Properties = {
		badge?: string;
		badgeColor?: Colors;
		classList?: string;
		color?: Colors;
		disabled?: boolean;
		expand?: 'block' | 'full';
		fill?: 'clear' | 'default' | 'outline' | 'solid';
		icon?: string;
		iconEnd?: string;
		iconSize?: 'large' | 'small';
		indexed?: string;
		label?: string;
		labelColor?: Colors;
		readonly?: boolean;
		shape?: 'round' | 'square';
		size?: 'default' | 'large' | 'small';
		type?: 'button' | 'reset' | 'submit';
		clicked?: (event?: MouseEvent) => void;
	} & (
		| { readonly: true; type?: 'button' | 'reset'; clicked?: (event?: MouseEvent) => void }
		| { readonly?: false; type?: 'button' | 'reset'; clicked: (event?: MouseEvent) => void }
		| { type: 'submit'; clicked?: never; readonly?: boolean }
	) &
		({ icon: string; label?: string } | { label: string; icon?: string });

	let {
		badge,
		badgeColor = 'danger',
		classList = '',
		clicked,
		color = 'secondary',
		disabled,
		expand,
		fill,
		icon,
		iconEnd,
		iconSize,
		indexed,
		label,
		labelColor,
		readonly,
		shape = 'round',
		size,
		type
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;

	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');

	function onClicked(event: MouseEvent): void {
		event.stopPropagation();
		clicked?.(event);
	}
</script>

<ion-button
	onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && clicked?.()}
	style={`pointer-events: ${readonly ? 'none' : 'auto'};`}
	shape={shape === 'round' ? 'round' : undefined}
	{color}
	{expand}
	{fill}
	class={classList}
	{size}
	{type}
	{disabled}
	onclick={(event: MouseEvent) => onClicked(event)}
	role="button"
	tabindex="0"
>
	{@render content()}
</ion-button>

{#snippet content()}
	{#if icon || iconEnd}
		{#if label}
			{#if icon}
				{@render startIcon()}
			{/if}
			{#if iconEnd}
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
	<ion-icon slot="end" color={labelColor} icon={iconEnd} size={size === 'large' ? 'large' : iconSize}></ion-icon>
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
