<script lang="ts">
	import { calendarClearOutline } from 'ionicons/icons';

	import CustomItem from './CustomItem.svelte';

	import { DateTimePickerType } from '$lib/models/ui';
	import { globalPopoverStore } from '$lib/stores';
	import { formatter } from '$lib/utility';

	type Properties = {
		label: string;
		classList?: string;
		hidden?: boolean;
		icon?: string;
		max?: string;
		min?: string;
		type?: DateTimePickerType;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: string; changed?: (value: string) => void }
	);

	let {
		changed,
		classList = '',
		hidden = false,
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

	let formValue = $state<string>();

	const currentValue = $derived(name ? formValue : value);
	const displayValue = $derived(currentValue ? formatter.date(currentValue, 'PPP') : '');

	$effect(() => {
		if (!name || !containerElement) return;

		containerElement.addEventListener('formUpdate', formUpdateHandler);
		return () => containerElement?.removeEventListener('formUpdate', formUpdateHandler);
	});

	function formUpdateHandler(event: Event): void {
		onFormUpdate(event as CustomEvent);
	}

	function onFormUpdate(event: CustomEvent): void {
		if (!name) return;
		const next = event.detail?.value;
		formValue = typeof next === 'string' && next.length > 0 ? next : undefined;
	}

	function onApply(nextValue: string): void {
		if (name) {
			formValue = nextValue;
			containerElement?.dispatchEvent(
				new CustomEvent('ionInput', {
					bubbles: true,
					detail: { key: name, value: nextValue }
				})
			);
		} else {
			changed?.(nextValue);
		}
	}

	function onBlur(): void {
		containerElement?.dispatchEvent(
			new CustomEvent('ionBlur', {
				bubbles: true,
				detail: { key: name }
			})
		);
	}

	function onOpenDatetimeModal(): void {
		datetimeInputItem.set({
			applied: onApply,
			dismissed: onBlur,
			max,
			min,
			open: true,
			type,
			value: currentValue
		});
	}
</script>

<div bind:this={containerElement} data-name={name} class="contents" class:hidden>
	<CustomItem {classList} {icon} clicked={onOpenDatetimeModal} {name} {hidden}>
		<div class="flex flex-col">
			<ion-text class="pt-2 text-xs">{label}</ion-text>
			<ion-text class="my-2 truncate">
				{displayValue}
			</ion-text>
		</div>
	</CustomItem>
</div>
