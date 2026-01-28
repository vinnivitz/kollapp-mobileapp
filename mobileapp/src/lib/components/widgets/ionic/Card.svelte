<script lang="ts">
	import type { OrganizationRole } from '@kollapp/api-types';
	import type { Snippet } from 'svelte';

	import LazyRender from '$lib/components/utility/LazyRender.svelte';
	import { type Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: OrganizationRole;
		border?: Colors;
		children?: Snippet;
		classList?: string;
		color?: Colors;
		icon?: string;
		indexed?: string;
		indexLabel?: string;
		lazy?: 'auto' | boolean;
		readonly?: boolean;
		subtitle?: string;
		title?: string;
		titleIconEnd?: string;
		titleIconStart?: string;
		tourId?: string;
		clicked?: () => void;
	};

	let {
		accessible,
		border,
		children,
		classList = '',
		clicked,
		color = border ? 'transparent' : 'light',
		icon,
		indexed,
		indexLabel,
		lazy = 'auto',
		readonly,
		subtitle,
		title,
		titleIconEnd,
		titleIconStart,
		tourId
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void accessible;
	void icon;

	let cardReference = $state<HTMLIonCardElement>();
	let detectedLazy = $state<boolean>(true);

	$effect(() => {
		if (lazy === 'auto' && cardReference) {
			const hasFormElement = !!cardReference.querySelector('form');
			detectedLazy = !hasFormElement;
		}
	});

	const effectiveLazy = $derived(lazy === 'auto' ? detectedLazy : lazy);
	const borderStyle = $derived(border ? `1px solid var(--ion-color-${border})` : '0px solid transparent');
</script>

{#if effectiveLazy}
	<LazyRender>
		{@render card()}
	</LazyRender>
{:else}
	{@render card()}
{/if}

{#snippet card()}
	{#if !!clicked}
		<ion-card
			bind:this={cardReference}
			onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && clicked?.()}
			role="button"
			tabindex="0"
			style={`pointer-events: ${readonly ? 'none' : 'auto'}; border: ${borderStyle}`}
			id={indexLabel}
			data-tour={tourId}
			{color}
			button
			class={classList}
			onclick={readonly ? undefined : clicked}
		>
			{@render content()}
		</ion-card>
	{:else}
		<ion-card
			bind:this={cardReference}
			id={indexLabel}
			data-tour={tourId}
			{color}
			class={classList}
			style={`border: ${borderStyle}`}
		>
			{@render content()}
		</ion-card>
	{/if}
{/snippet}

{#snippet content()}
	{#if title || subtitle || titleIconStart || titleIconEnd}
		<ion-card-header>
			<ion-card-title class="flex items-center justify-center gap-2 text-center text-xl">
				{#if titleIconStart}
					<ion-icon icon={titleIconStart}></ion-icon>
				{/if}
				{#if title}
					<ion-text>{title}</ion-text>
				{/if}
				{#if titleIconEnd}
					<ion-icon icon={titleIconEnd}></ion-icon>
				{/if}
			</ion-card-title>
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
		--background: var(--ion-background-color-step-50);

		ion-card-title {
			--color: var(--ion-color-dark);
		}
	}
</style>
