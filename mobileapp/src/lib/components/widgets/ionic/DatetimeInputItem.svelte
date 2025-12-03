<script lang="ts">
	import { TZDate } from '@date-fns/tz';
	import { format, parse } from 'date-fns';
	import { calendarClearOutline, calendarOutline } from 'ionicons/icons';

	import CustomItem from './CustomItem.svelte';

	import { DateTimePickerType } from '$lib/models/ui';
	import { globalPopoverStore } from '$lib/stores';

	type Properties = {
		label: string;
		card?: boolean;
		classList?: string;
		icon?: string;
		max?: string;
		min?: string;
		type?: DateTimePickerType;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: string; changed?: (value: string) => void }
	);

	let {
		card,
		changed,
		classList = '',
		icon = calendarClearOutline,
		label,
		max,
		min,
		name,
		type = DateTimePickerType.DATE,
		value
	}: Properties = $props();

	const { datetimeInputItem } = globalPopoverStore;

	let containerElement = $state<HTMLDivElement>();
	let displayValue = $state<string>(value ? format(new TZDate(value), 'PPP') : format(new TZDate(), 'PPP'));

	$effect(() => {
		if (value) {
			displayValue = format(new TZDate(value), 'PPP');
		}
	});

	function notifyChange(rawValue: string): void {
		if (name && containerElement) {
			containerElement.dispatchEvent(
				new CustomEvent('customChange', {
					bubbles: true,
					detail: { key: name, value: rawValue }
				})
			);
		} else {
			changed?.(rawValue);
		}
	}

	function onApply(rawValue: string): void {
		displayValue = format(rawValue, 'PPP');
		notifyChange(rawValue);
	}

	function onOpenDatetimeModal(): void {
		datetimeInputItem.set({
			applied: onApply,
			max,
			min,
			open: true,
			type,
			value: displayValue ? format(parse(displayValue, 'PPP', new TZDate()), 'yyyy-MM-dd') : undefined
		});
	}
</script>

<div bind:this={containerElement}>
	<CustomItem {classList} {card} {icon} iconEnd={calendarOutline} clicked={onOpenDatetimeModal} {name}>
		<div class="flex flex-col">
			<ion-text class="ms-3 pt-2 text-xs">{label}</ion-text>
			<ion-text class="my-2 ms-4 truncate">
				{displayValue || ''}
			</ion-text>
		</div>
	</CustomItem>
</div>
