<script lang="ts">
	import { format } from 'date-fns';
	import { calendarClearOutline } from 'ionicons/icons';

	import Button from './Button.svelte';
	import CustomItem from './CustomItem.svelte';

	import { DateTimePickerType } from '$lib/models/ui';
	import { globalPopoverStore } from '$lib/stores';

	type Properties = {
		label: string;
		max?: string;
		min?: string;
		type?: DateTimePickerType;
		value?: string;
		applied?: (value: string) => void;
		dismiss?: () => void;
	};

	const { datetimeInputItem } = globalPopoverStore;

	let { applied, dismiss, label, max, min, type = DateTimePickerType.DATE, value }: Properties = $props();

	let selectedValue = $state(value ?? new Date().toISOString());
	let includeDate = $state(true);
	let includeTime = $state(false);

	function onApply(value: string): void {
		selectedValue = value;
		datetimeInputItem.update((item) => ({ ...item, value }));
		applied?.(format(selectedValue, includeDate ? 'yyyy-MM-dd' : 'HH:mm'));
	}

	function onDismiss(): void {
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
		datetimeInputItem.set({
			applied: onApply,
			dismissed: onDismiss,
			includeDate,
			includeTime,
			max,
			min,
			open: true,
			value: selectedValue
		});
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
