<script lang="ts">
	import { Layout } from '$lib/models/store';
	import type { Colors } from '$lib/models/ui';
	import { layoutStore } from '$lib/store';

	let {
		color,
		iconSrc,
		label,
		name,
		type = 'text',
		value,
		change
	}: {
		label: string;
		name: string;
		color?: Colors | undefined;
		iconSrc?: string;
		type?:
			| 'number'
			| 'search'
			| 'text'
			| 'tel'
			| 'url'
			| 'email'
			| 'date'
			| 'time'
			| 'datetime-local'
			| 'month'
			| 'password'
			| 'week'
			| undefined;
		value?: string | number | null | undefined;
		change?: (value: string) => void;
	} = $props();

	const isPlayfulLayout = $derived($layoutStore === Layout.PLAYFUL);
	const isClassicLayout = $derived($layoutStore === Layout.CLASSIC);
</script>

<ion-item {color} data-playful={isPlayfulLayout} data-classic={isClassicLayout}>
	{#if iconSrc}
		<ion-icon icon={iconSrc} slot="start"></ion-icon>
	{/if}
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		{name}
		{label}
		{type}
		{value}
		on:ionInput={(event) => change?.(event.detail.value || '')}
	></ion-input>
</ion-item>

<style lang="postcss">
	ion-item::part(native) {
		margin-bottom: 5px;
	}

	ion-item[data-playful='true']::part(native) {
		border-radius: 20px;
	}
	ion-item[data-classic='true']::part(native) {
		border-radius: 5px;
	}
	ion-input {
		--color: var(--ion-text-color-step-300);
	}
</style>
