<script lang="ts">
	import moment from 'moment';

	import { locale, t } from '$lib/locales';
	import type { Colors } from '$lib/models/ui';
	import { clickOutside } from '$lib/utils';

	let {
		showApplyButton = false,
		showCancelButton = false,
		cancelText = $t('components.widgets.calendar.cancel-button.label'),
		applyText: submitText = $t('components.widgets.calendar.done-button.label'),
		change,
		dismiss,
		color = 'secondary',
		showTitle = true
	}: {
		showApplyButton?: boolean;
		showCancelButton?: boolean;
		cancelText?: string;
		applyText?: string;
		change?: (value: string) => void | Promise<void>;
		dismiss?: () => void | Promise<void>;
		color?: Colors;
		showTitle?: boolean;
	} = $props();

	let calendar = $state<HTMLIonDatetimeElement>();
	let selectedDate = $state(moment().format('YYYY-MM-DD'));
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-datetime
	cancel-text={cancelText}
	done-text={submitText}
	use:clickOutside
	on:blur={() => calendar?.reset()}
	{color}
	size="cover"
	max={moment().add(10, 'years').format('YYYY-MM-DD')}
	bind:this={calendar}
	on:ionChange={(event) => {
		selectedDate = event.detail.value as string;
		change?.(selectedDate);
	}}
	locale={$locale}
	first-day-of-week={1}
	presentation="date"
>
	{#if showTitle}
		<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
	{/if}
	<ion-buttons slot="buttons">
		{#if showCancelButton}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<ion-button
				color="secondary"
				fill="outline"
				on:click={() => {
					calendar?.reset();
					dismiss?.();
				}}
				on:keydown={(event) => event.key === 'Enter' && calendar?.reset()}>{cancelText}</ion-button
			>
		{/if}
		{#if showApplyButton}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<ion-button
				color="primary"
				fill="solid"
				on:click={() => {
					change?.(selectedDate);
					dismiss?.();
				}}
				on:keydown={(event) => event.key === 'Enter' && change?.(selectedDate)}>{submitText}</ion-button
			>
		{/if}
	</ion-buttons>
</ion-datetime>
