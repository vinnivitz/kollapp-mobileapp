<script lang="ts">
	import type { UserRole } from '$lib/models/api';
	import type { Snippet } from 'svelte';

	import { type Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: UserRole[];
		border?: Colors;
		children?: Snippet;
		classList?: string;
		color?: Colors | undefined;
		icon?: string;
		id?: string;
		readonly?: boolean;
		searchable?: string;
		subtitle?: string;
		title?: string;
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
		readonly,
		searchable,
		subtitle,
		title
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;
	void accessible;
	void id;
	void icon;

	const borderClass = $derived(border ? `border border-[var(--ion-color-${border})]` : '');
</script>

{#if !!clicked}
	<ion-card
		onkeydown={(_event) => _event.key === 'Enter' && clicked?.()}
		role="button"
		tabindex="0"
		style={`pointer-events: ${readonly ? 'none' : 'auto'};`}
		{id}
		{color}
		button
		class={`${borderClass} ${classList}`}
		onclick={clicked}
	>
		{@render content()}
	</ion-card>
{:else}
	<ion-card {id} {color} class={`${borderClass} ${classList}`}>
		{@render content()}
	</ion-card>
{/if}

{#snippet content()}
	{#if title || subtitle}
		<ion-card-header>
			<ion-card-title class="text-center text-2xl">{title}</ion-card-title>
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
