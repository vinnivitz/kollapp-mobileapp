<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { DatetimeChangeEventDetail } from '@ionic/core';

	import { addYears } from 'date-fns';

	import { t } from '$lib/locales';
	import { localeStore } from '$lib/stores';
	import { clickOutside } from '$lib/utility';

	type Properties = {
		applyText?: string;
		color?: Colors;
		dismissText?: string;
		includeDate?: boolean;
		includeTime?: boolean;
		max?: string;
		min?: string;
		showButtons?: boolean;
		showTitle?: boolean;
		value?: string;
		applied?: (value: string) => void;
		dismissed?: () => void;
	};

	let {
		applied,
		applyText = $t('components.widgets.calendar.done-button.label'),
		color = 'secondary',
		dismissed,
		dismissText = $t('components.widgets.calendar.dismiss-button.label'),
		includeDate = true,
		includeTime = false,
		max = addYears(new Date(), 10).toISOString(),
		min,
		showButtons = true,
		showTitle = true,
		value = new Date().toISOString()
	}: Properties = $props();

	let calendar = $state<HTMLIonDatetimeElement>();

	function onDismiss(): void {
		calendar?.reset();
		dismissed?.();
	}

	async function onApply(event: CustomEvent<DatetimeChangeEventDetail>): Promise<void> {
		calendar?.reset();
		value = event.detail.value as string;
		applied?.(value);
	}

	function getPresentation(): 'date-time' | 'date' | 'time' {
		if (includeDate && includeTime) return 'date-time';
		if (includeDate) return 'date';
		return 'time';
	}
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-datetime
	{value}
	{min}
	{max}
	show-default-buttons={showButtons}
	cancel-text={dismissText}
	done-text={applyText}
	use:clickOutside
	on:blur={onDismiss}
	{color}
	size="cover"
	bind:this={calendar}
	locale={$localeStore}
	on:ionChange={onApply}
	first-day-of-week={1}
	presentation={getPresentation()}
>
	{#if showTitle}
		<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
	{/if}
</ion-datetime>
