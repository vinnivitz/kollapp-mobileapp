<script lang="ts">
	import type { UserRole } from '$lib/models/api';
	import type { Snippet } from 'svelte';

	import { type Colors } from '$lib/models/ui';

	type Properties = {
		accessible?: UserRole[];
		children?: Snippet;
		classList?: string;
		color?: Colors | undefined;
		contentHeight?: number;
		icon?: string;
		id?: string;
		searchable?: string;
		subtitle?: string;
		title?: string;
		click?: () => void;
	};

	let {
		accessible,
		children,
		classList,
		click,
		color,
		contentHeight,
		icon,
		id,
		searchable,
		subtitle,
		title
	}: Properties = $props();

	// workaround to avoid reference linting error
	void searchable;
	void accessible;
	void id;
	void icon;
</script>

{#if !!click}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<ion-card {id} {color} button={!!click} class={classList} onclick={click}>
		{@render content()}
	</ion-card>
{:else}
	<ion-card {id} {color} button={!!click} class={classList}>
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
		<ion-card-content class={`${contentHeight ? 'h-[' + contentHeight + 'vh]' : ''}`}>
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

		.ion-card-content {
			height: 400px;
		}
	}
</style>
