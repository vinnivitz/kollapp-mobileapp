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
		searchable?: string;
		subtitle?: string;
		title?: string;
		click?: () => void;
	};

	let { accessible, border, children, classList, click, color, icon, id, searchable, subtitle, title }: Properties =
		$props();

	// workaround to avoid reference linting error
	void searchable;
	void accessible;
	void id;
	void icon;

	const _color: Colors = $derived(color ?? (border ? 'transparent' : 'light'));
</script>

{#if !!click}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<ion-card
		{id}
		color={_color}
		button={!!click}
		class={border ? `border border-[var(--ion-color-${border})] ${classList} ` : classList}
		onclick={click}
	>
		{@render content()}
	</ion-card>
{:else}
	<ion-card
		{id}
		color={_color}
		button={!!click}
		class={border ? `border border-[var(--ion-color-${border})] ${classList} ` : classList}
	>
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
