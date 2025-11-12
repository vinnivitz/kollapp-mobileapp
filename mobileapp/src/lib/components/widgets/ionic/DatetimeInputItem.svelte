<script lang="ts">
	import { TZDate } from '@date-fns/tz';
	import { format, parse } from 'date-fns';
	import { calendarClearOutline, calendarOutline } from 'ionicons/icons';

	import TextInputItem from './TextInputItem.svelte';

	import { DateTimePickerType } from '$lib/models/ui';
	import { globalPopoverStore } from '$lib/stores';

	type Properties = {
		label: string;
		card?: boolean;
		icon?: string;
		max?: string;
		min?: string;
		type?: DateTimePickerType;
	} & (
		| { name: string; applied?: never; value?: never }
		| { value: string; name?: never; applied?: (value: string) => void }
	);

	let {
		applied,
		card,
		icon = calendarClearOutline,
		label,
		max,
		min,
		name = '',
		type = DateTimePickerType.DATE,
		value
	}: Properties = $props();

	const { datetimeInputItem } = globalPopoverStore;

	$effect(() => {
		if (value && element) {
			element.value = format(new TZDate(value), 'PPP');
		}
	});

	let element = $state<HTMLIonInputElement>();

	function onApply(value: string): void {
		const date = format(value, 'PPP');
		applied?.(value);
		element!.value = date;
		element?.dispatchEvent(new CustomEvent('ionInput', { bubbles: true }));
	}

	function onOpenDatetimeModal(): void {
		datetimeInputItem.set({
			applied: onApply,
			max,
			min,
			open: true,
			type,
			value: element?.value ? format(parse(element.value.toString(), 'PPP', new TZDate()), 'yyyy-MM-dd') : undefined
		});
	}
</script>

<TextInputItem
	{card}
	inputElement={(value) => (element = value)}
	{label}
	{icon}
	{name}
	readonly
	inputIcon={calendarOutline}
	clicked={onOpenDatetimeModal}
/>
