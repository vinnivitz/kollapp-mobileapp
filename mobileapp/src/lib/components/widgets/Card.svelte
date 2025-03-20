<script lang="ts">
	import type { Snippet } from 'svelte';

	import { type Colors } from '$lib/models/ui';

	type Properties = {
		children?: Snippet;
		classProp?: string;
		color?: Colors | undefined;
		subtitle?: string;
		title?: string;
		click?: () => Promise<void> | void;
	};

	let { children, classProp, click, color, subtitle, title }: Properties = $props();
</script>

{#if !!click}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<ion-card {color} button={!!click} class={classProp} onclick={click}>
		{@render content()}
	</ion-card>
{:else}
	<ion-card {color} button={!!click} class={classProp}>
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

<style>
	ion-card {
		--background: var(--ion-color-light);

		ion-card-title {
			--color: var(--ion-color-dark);
		}
	}
</style>
