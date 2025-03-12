<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Colors, Layout } from '$lib/models/ui';
	import { layoutStore } from '$lib/stores';

	type Properties = {
		children?: Snippet;
		classProp?: string;
		click?: () => void | Promise<void>;
		color?: Colors | undefined;
		subtitle?: string;
		title?: string;
	};

	let { children, classProp, click, color, subtitle, title }: Properties = $props();

	const isModernLayout = $derived($layoutStore === Layout.MODERN);
	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
</script>

{#if !!click}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<ion-card
		{color}
		button={!!click}
		class={classProp}
		class:rounded-3xl={isPlayfulLayout}
		class:squared={isModernLayout}
		onclick={click}
	>
		{@render content()}
	</ion-card>
{:else}
	<ion-card
		{color}
		button={!!click}
		class={classProp}
		class:rounded-3xl={isPlayfulLayout}
		class:squared={isModernLayout}
	>
		{@render content()}
	</ion-card>
{/if}

{#snippet content()}
	{#if title || subtitle}
		<ion-card-header>
			<ion-card-title class="text-center">{title}</ion-card-title>
			{#if subtitle}
				<ion-card-subtitle>{subtitle}</ion-card-subtitle>
			{/if}
		</ion-card-header>
	{/if}
	{#if children}
		<ion-card-content>
			{@render children()}
		</ion-card-content>
	{/if}
{/snippet}

<style lang="postcss">
	ion-card {
		--background: var(--ion-color-light);

		ion-card-title {
			--color: var(--ion-color-dark);
		}
	}
	.squared {
		border-radius: unset !important;
	}
</style>
