<script lang="ts">
	import type { DatetimeChangeEventDetail } from '@ionic/core';

	import { TZDate } from '@date-fns/tz';
	import { addYears, format } from 'date-fns';

	import { t } from '$lib/locales';
	import { type Colors, DateTimePickerType } from '$lib/models/ui';
	import { localeStore } from '$lib/stores';
	import { clickOutside } from '$lib/utility';

	type Properties = {
		applyText?: string;
		color?: Colors;
		dismissText?: string;
		max?: string;
		min?: string;
		showButtons?: boolean;
		showTitle?: boolean;
		type?: DateTimePickerType;
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
		max = format(addYears(new TZDate(), 10), 'yyyy-MM-dd'),
		min,
		showButtons = true,
		showTitle = true,
		type = DateTimePickerType.DATE,
		value
	}: Properties = $props();

	function onDismiss(): void {
		dismissed?.();
	}

	async function onApply(event: CustomEvent<DatetimeChangeEventDetail>): Promise<void> {
		value = event.detail.value as string;
		applied?.(value);
	}
</script>

<ion-datetime
	{value}
	{min}
	{max}
	show-default-buttons={showButtons}
	cancel-text={dismissText}
	done-text={applyText}
	use:clickOutside
	onblur={onDismiss}
	{color}
	size="cover"
	locale={$localeStore}
	onionChange={onApply}
	first-day-of-week={1}
	presentation={type}
>
	{#if showTitle}
		<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
	{/if}
</ion-datetime>
