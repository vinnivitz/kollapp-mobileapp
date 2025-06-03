<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { DatetimeChangeEventDetail } from '@ionic/core';

	import { addYears } from 'date-fns';

	import { locale, t } from '$lib/locales';
	import { clickOutside } from '$lib/utility';

	type Properties = {
		applyText?: string;
		color?: Colors;
		dismissText?: string;
		includeDate?: boolean;
		includeTime?: boolean;
		showTitle?: boolean;
		value?: string;
		apply?: (value: string) => void;
		dismiss?: () => void;
	};

	let {
		apply,
		applyText = $t('components.widgets.calendar.done-button.label'),
		color = 'secondary',
		dismiss,
		dismissText = $t('components.widgets.calendar.dismiss-button.label'),
		includeDate = true,
		includeTime = false,
		showTitle = true,
		value = new Date().toISOString()
	}: Properties = $props();

	let calendar = $state<HTMLIonDatetimeElement>();
	let selectedDate = $state(new Date().toISOString());

	function onDismiss(): void {
		calendar?.reset();
		dismiss?.();
	}

	async function onApply(event: CustomEvent<DatetimeChangeEventDetail>): Promise<void> {
		calendar?.reset();
		selectedDate = event.detail.value as string;
		apply?.(selectedDate);
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
	show-default-buttons
	cancel-text={dismissText}
	done-text={applyText}
	use:clickOutside
	on:blur={onDismiss}
	{color}
	size="cover"
	max={addYears(new Date(), 10).toISOString()}
	bind:this={calendar}
	locale={$locale}
	on:ionChange={onApply}
	first-day-of-week={1}
	presentation={getPresentation()}
>
	{#if showTitle}
		<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
	{/if}
</ion-datetime>
