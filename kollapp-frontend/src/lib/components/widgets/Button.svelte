<script lang="ts">
	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';

	let {
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
		disabled,
		click
	}: {
		label?: string;
		color?: Colors | undefined;
		expand?: 'full' | 'block' | undefined;
		fill?: 'clear' | 'default' | 'outline' | 'solid' | undefined;
		classProp?: string;
		size?: 'default' | 'small' | 'large' | undefined;
		click?: () => void | Promise<void>;
		iconSrc?: string;
		iconSize?: 'small' | 'large' | undefined;
		iconPosition?: 'start' | 'end';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
	} = $props();

	const isMondernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const shape = $derived(isPlayfulLayout ? 'round' : undefined);
	const textColor = $derived(fill === 'outline' ? color : 'white');
	const fontWeight = $derived(fill === 'outline' ? 'font-extrabold' : 'font-medium');
</script>

{#if !!click}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
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
	>
		{@render content()}
	</ion-button>
{:else}
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
	>
		{@render content()}
	</ion-button>
{/if}

{#snippet content()}
	{#if iconSrc}
		{#if iconPosition === 'start'}
			{@render startIcon()}
		{:else}
			{@render endIcon()}
		{/if}
	{/if}
	{#if label}
		<ion-text color={textColor} class={fontWeight}>
			{label}
		</ion-text>
	{/if}
{/snippet}

{#snippet startIcon()}
	<ion-icon slot="start" color={textColor} icon={iconSrc} size={iconSize}></ion-icon>
{/snippet}

{#snippet endIcon()}
	<ion-icon slot="end" color={textColor} icon={iconSrc} size={iconSize}></ion-icon>
{/snippet}

<style lang="postcss">
	.squared {
		--border-radius: 0;
	}
</style>
