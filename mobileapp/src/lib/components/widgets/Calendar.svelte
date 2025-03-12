<script lang="ts">
	import type { DatetimeChangeEventDetail } from '@ionic/core';
	import moment from 'moment';

	import { locale, t } from '$lib/locales';
	import type { Colors } from '$lib/models/ui';
	import { clickOutside } from '$lib/utils';

	type Properties = {
		apply?: (value: string) => void | Promise<void>;
		applyText?: string;
		dismiss?: () => void | Promise<void>;
		color?: Colors;
		dismissText?: string;
		showTitle?: boolean;
	};

	let {
		apply,
		applyText = $t('components.widgets.calendar.done-button.label'),
		color = 'secondary',
		dismiss,
		dismissText = $t('components.widgets.calendar.dismiss-button.label'),
		showTitle = true
	}: Properties = $props();

	let calendar = $state<HTMLIonDatetimeElement>();
	let selectedDate = $state(moment().format('YYYY-MM-DD'));

	function onDismiss(): void {
		calendar?.reset();
		dismiss?.();
	}

	async function onApply(event: CustomEvent<DatetimeChangeEventDetail>): Promise<void> {
		calendar?.reset();
		selectedDate = event.detail.value as string;
		apply?.(selectedDate);
	}
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-datetime
	show-default-buttons
	cancel-text={dismissText}
	done-text={applyText}
	use:clickOutside
	on:blur={onDismiss}
	{color}
	size="cover"
	max={moment().add(10, 'years').format('YYYY-MM-DD')}
	bind:this={calendar}
	locale={$locale}
	on:ionChange={onApply}
	first-day-of-week={1}
	presentation="date"
>
	{#if showTitle}
		<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
	{/if}
</ion-datetime>
