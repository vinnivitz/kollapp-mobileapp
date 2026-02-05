<script lang="ts">
	import type { OrganizationRole } from '@kollapp/api-types';
	import type { Snippet } from 'svelte';

	import { LazyRender } from '$lib/components/utility';
	import { Button } from '$lib/components/widgets/ionic';
	import { type Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: OrganizationRole;
		ariaLabel?: string;
		border?: Colors;
		children?: Snippet;
		classList?: string;
		color?: Colors;
		contentClass?: string;
		iconColor?: Colors;
		indexed?: string;
		indexLabel?: string;
		lazy?: boolean;
		readonly?: boolean;
		subtitle?: string;
		title?: string;
		titleIconEnd?: string;
		titleIconStart?: string;
		tourId?: string;
		clicked?: () => void;
		titleIconEndClicked?: () => void;
		titleIconStartClicked?: () => void;
	};

	let {
		accessible,
		ariaLabel,
		border,
		children,
		classList = '',
		clicked,
		color = border ? 'transparent' : 'light',
		contentClass = '',
		iconColor,
		indexed,
		indexLabel,
		lazy = false,
		readonly,
		subtitle,
		title,
		titleIconEnd,
		titleIconEndClicked,
		titleIconStart,
		titleIconStartClicked,
		tourId
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void accessible;

	const borderStyle = $derived(border ? `1px solid var(--ion-color-${border})` : '0px solid transparent');
	const computedAriaLabel = $derived(ariaLabel ?? title ?? undefined);
</script>

{#if lazy}
	<LazyRender>
		{@render card()}
	</LazyRender>
{:else}
	{@render card()}
{/if}

{#snippet card()}
	{#if !!clicked}
		<ion-card
			onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && clicked?.()}
			role="button"
			tabindex="0"
			aria-label={computedAriaLabel}
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
		<ion-card id={indexLabel} data-tour={tourId} {color} class={classList} style={`border: ${borderStyle}`}>
			{@render content()}
		</ion-card>
	{/if}
{/snippet}

{#snippet content()}
	{#if title || subtitle || titleIconStart || titleIconEnd}
		<ion-card-header>
			<ion-card-title class="flex items-center justify-center gap-2 text-center text-xl">
				{#if titleIconStart}
					{#if titleIconStartClicked}
						<Button size="small" fill="outline" icon={titleIconStart} clicked={titleIconStartClicked} />
					{:else}
						<ion-icon icon={titleIconStart} color={iconColor}></ion-icon>
					{/if}
				{/if}
				{#if title}
					<ion-text>{title}</ion-text>
				{/if}
				{#if titleIconEnd}
					{#if titleIconEndClicked}
						<Button size="small" fill="outline" icon={titleIconEnd} clicked={titleIconEndClicked} />
					{:else}
						<ion-icon icon={titleIconEnd} color={iconColor}></ion-icon>
					{/if}
				{/if}
			</ion-card-title>
			{#if subtitle}
				<ion-card-subtitle>{subtitle}</ion-card-subtitle>
			{/if}
		</ion-card-header>
	{/if}
	{#if children}
		<ion-card-content class={contentClass}>
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
