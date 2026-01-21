<script lang="ts">
	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import { calendarClearOutline } from 'ionicons/icons';
	import { onDestroy, onMount } from 'svelte';

	import CustomItem from './CustomItem.svelte';

	import { DateTimePickerType } from '$lib/models/ui';
	import { globalPopoverStore } from '$lib/stores';

	type Properties = {
		label: string;
		card?: boolean;
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
		card,
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
	let hiddenInputElement = $state<HTMLIonInputElement>();
	let intervalId: ReturnType<typeof setInterval> | undefined;
	let rawValue = $state<string | undefined>(value);
	let displayValue = $derived<string>(rawValue ? format(new TZDate(rawValue), 'PPP') : '');

	function setValue(next: string): void {
		rawValue = next;
	}

	$effect(() => {
		if (value !== undefined) {
			setValue(value);
		}
	});

	onMount(() => {
		if (!name) return;
		intervalId = setInterval(async () => {
			const native = await hiddenInputElement?.getInputElement();
			if (!native) return;
			const next = (native.value ?? '').toString();
			const current = (rawValue ?? '').toString();
			if (next !== current) {
				rawValue = next.length > 0 ? next : undefined;
			}
		}, 200);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
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
		setValue(rawValue);
		notifyChange(rawValue);
	}

	function onOpenDatetimeModal(): void {
		datetimeInputItem.set({
			applied: onApply,
			max,
			min,
			open: true,
			type,
			value: rawValue
		});
	}
</script>

<div bind:this={containerElement} data-name={name} class="contents" class:hidden>
	{#if name}
		<ion-input bind:this={hiddenInputElement} {name} value={rawValue ?? ''} readonly style="display:none"></ion-input>
	{/if}
	<CustomItem {classList} {card} {icon} clicked={onOpenDatetimeModal} {name} {hidden}>
		<div class="flex flex-col">
			<ion-text class="ms-3 pt-2 text-xs">{label}</ion-text>
			<ion-text class="my-2 ms-4 truncate">
				{displayValue || ''}
			</ion-text>
		</div>
	</CustomItem>
</div>
