<script lang="ts">
	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';

	let {
		click,
		label,
		classProp,
		color = 'secondary',
		expand,
		fill,
		size,
		iconSrc,
		iconSize = 'small',
		iconPosition = 'start',
		type,
		disabled
	}: {
		click?: () => void | Promise<void>;
		label: string;
		color?: Colors | undefined;
		expand?: 'full' | 'block' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		classProp?: string;
		size?: 'default' | 'small' | 'large' | undefined;
		iconSrc?: string;
		iconSize?: 'small' | 'large' | undefined;
		iconPosition?: 'start' | 'end';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
	} & (
		| { type: 'submit'; click?: never }
		| { type?: 'button' | 'reset'; click: () => void | Promise<void> }
	) = $props();

	const isMondernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const shape = $derived(isPlayfulLayout ? 'round' : undefined);
	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

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
	onclick={click}
	onkeydown={(event) => event.key === 'Enter' && click?.()}
	role="button"
	tabindex="0"
>
	{@render content()}
</ion-button>

{#snippet content()}
	{#if iconSrc}
		{#if iconPosition === 'start'}
			{@render startIcon()}
		{:else}
			{@render endIcon()}
		{/if}
	{/if}
	{#if label}
		<ion-text class={fontWeight}>
			{label}
		</ion-text>
	{/if}
{/snippet}

{#snippet startIcon()}
	<ion-icon slot="start" icon={iconSrc} size={iconSize}></ion-icon>
{/snippet}

{#snippet endIcon()}
	<ion-icon slot="end" icon={iconSrc} size={iconSize}></ion-icon>
{/snippet}

<style lang="postcss">
	.squared {
		--border-radius: 0;
	}
</style>
