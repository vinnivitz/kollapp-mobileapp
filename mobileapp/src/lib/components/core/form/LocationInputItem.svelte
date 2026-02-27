<script lang="ts">
	import { locationOutline, mapOutline } from 'ionicons/icons';

	import { InputItem, Modal } from '$lib/components/core';
	import { MapView } from '$lib/components/shared';
	import { t } from '$lib/locales';

	type Properties = {
		label: string;
		classList?: string;
		helperText?: string;
		hidden?: boolean;
		icon?: string;
	} & (
		| { name: string; changed?: never; value?: never }
		| { name?: never; value?: string; changed?: (value: string) => void }
	);

	let {
		changed,
		classList = '',
		helperText,
		hidden = false,
		icon = locationOutline,
		label,
		name,
		value
	}: Properties = $props();

	let cachedLocation = $state<string>('');
	let open = $state<boolean>(false);
	let internalValue = $derived<string>(value ?? '');
	let inputElement = $state<HTMLIonInputElement>();

	async function onConfirmMap(): Promise<void> {
		internalValue = cachedLocation;
		inputElement!.value = internalValue;
		inputElement?.dispatchEvent(new CustomEvent('ionInput', { bubbles: true }));
		changed?.(internalValue);
		open = false;
	}

	function onDismissMap(): void {
		open = false;
	}
</script>

<InputItem
	{classList}
	{helperText}
	{hidden}
	inputElement={(element) => (inputElement = element)}
	{...name ? { name } : { value: value ?? '' }}
	{label}
	{icon}
	inputIcon={mapOutline}
	inputIconClicked={() => (open = true)}
/>

<Modal
	{open}
	informational={!cachedLocation}
	confirmLabel={$t('components.widgets.ionic.location-input-item.modal.confirm')}
	dismissed={onDismissMap}
	confirmed={onConfirmMap}
	initialBreakPoint={1}
	breakpoints={false}
>
	{#if open}
		<MapView
			value={inputElement?.value as string}
			selected={(location) => (cachedLocation = location)}
			classList="-m-4"
		/>
	{/if}
</Modal>
