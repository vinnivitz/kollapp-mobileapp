<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';
	import { clickableElement } from '$lib/utils';

	let {
		children,
		classProp,
		color = 'secondary',
		expand,
		fill,
		size,
		iconSrc,
		iconSize = 'large',
		iconPosition = 'start',
		type,
		disabled,
		click
	}: {
		color?: Colors | undefined;
		children?: Snippet;
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
	use:clickableElement={() => click?.()}
>
	{#if iconSrc}
		{#if iconPosition === 'start'}
			<ion-icon slot="start" icon={iconSrc} size={iconSize}></ion-icon>
		{:else}
			<ion-icon slot="end" icon={iconSrc} size={iconSize}></ion-icon>
		{/if}
	{/if}
	{#if children}
		<ion-text
			color={textColor}
			class="light:font-medium black-and-white:font-medium dark:font-bold"
		>
			{@render children?.()}
		</ion-text>
	{/if}
</ion-button>

<style lang="postcss">
	ion-button {
		.squared {
			--border-radius: 0;
		}
	}
</style>
