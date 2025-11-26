<script lang="ts">
	import type { OrganizationRole } from '@kollapp/api-types';
	import type { Snippet } from 'svelte';

	import { type Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: OrganizationRole;
		border?: Colors;
		children?: Snippet;
		classList?: string;
		color?: Colors | undefined;
		icon?: string;
		id?: string;
		indexed?: string;
		readonly?: boolean;
		subtitle?: string;
		title?: string;
		titleIconEnd?: string;
		titleIconStart?: string;
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
		id,
		indexed,
		readonly,
		subtitle,
		title,
		titleIconEnd,
		titleIconStart
	}: Properties = $props();

	// workaround to avoid reference linting error
	void indexed;
	void accessible;
	void id;
	void icon;

	const borderStyle = $derived(border ? `1px solid var(--ion-color-${border})` : '0px solid transparent');
</script>

{#if !!clicked}
	<ion-card
		onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && clicked?.()}
		role="button"
		tabindex="0"
		style={`pointer-events: ${readonly ? 'none' : 'auto'}; border: ${borderStyle}`}
		{id}
		{color}
		button
		class={classList}
		onclick={clicked}
	>
		{@render content()}
	</ion-card>
{:else}
	<ion-card {id} {color} class={classList} style={`border: ${borderStyle}`}>
		{@render content()}
	</ion-card>
{/if}

{#snippet content()}
	{#if title || subtitle || titleIconStart || titleIconEnd}
		<ion-card-header>
			<ion-card-title class="flex items-center justify-center gap-2 text-center text-2xl">
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
