<script lang="ts">
	import { format } from 'date-fns';
	import { calendarClearOutline } from 'ionicons/icons';

	import Button from './Button.svelte';
	import CustomItem from './CustomItem.svelte';
	import Datetime from './Datetime.svelte';

	import { DateTimePickerType } from '$lib/models/ui';

	type Properties = {
		label: string;
		type?: DateTimePickerType;
		value?: string;
		apply?: (value: string) => void;
		dismiss?: () => void;
	};

	let { apply, dismiss, label, type = DateTimePickerType.DATE, value }: Properties = $props();

	let showDatetimeModal = $state(false);
	let selectedValue = $state(value ?? new Date().toISOString());
	let includeDate = $state(true);
	let includeTime = $state(false);

	function onApply(value: string): void {
		selectedValue = value;
		showDatetimeModal = false;
		value = includeDate ? format(value, 'yyyy-mm-dd') : format(value, 'hh:mm');
		apply?.(value);
	}

	function onDismiss(): void {
		showDatetimeModal = false;
		dismiss?.();
	}

	function onOpenDatetimeModal(type: DateTimePickerType): void {
		switch (type) {
			case DateTimePickerType.DATE: {
				includeDate = true;
				includeTime = false;
				break;
			}
			case DateTimePickerType.TIME: {
				includeDate = false;
				includeTime = true;
				break;
			}
		}
		showDatetimeModal = true;
	}
</script>

<CustomItem icon={calendarClearOutline}>
	<div class="flex flex-col">
		<ion-text class="ms-3 pt-2 text-xs">
			{label}
		</ion-text>
		<div class="-ms-5 flex">
			{#if type === DateTimePickerType.DATE || type === DateTimePickerType.DATETIME}
				<Button
					classList="m-0 ms-1"
					fill="clear"
					color="dark"
					size="default"
					type="button"
					click={() => onOpenDatetimeModal(DateTimePickerType.DATE)}
					label={format(selectedValue, 'PPP')}
				></Button>
			{/if}
			{#if type === DateTimePickerType.TIME || type === DateTimePickerType.DATETIME}
				<Button
					classList="m-0"
					fill="clear"
					color="dark"
					size="default"
					type="button"
					click={() => onOpenDatetimeModal(DateTimePickerType.TIME)}
					label={format(selectedValue, 'p')}
				></Button>
			{/if}
		</div>
	</div>
</CustomItem>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover class="extended" is-open={showDatetimeModal} on:didDismiss={() => (showDatetimeModal = false)}>
	<div class="text-center">
		<Datetime value={selectedValue} apply={onApply} dismiss={onDismiss} {includeDate} {includeTime} />
	</div>
</ion-popover>
