<script lang="ts">
	import { locationOutline, mapOutline } from 'ionicons/icons';

	import Modal from './Modal.svelte';
	import TextInputItem from './TextInputItem.svelte';
	import LeafletMap from '../LeafletMap.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		label: string;
		name: string;
		icon?: string;
	};

	let { icon = locationOutline, label, name }: Properties = $props();

	let cachedLocation = $state('');
	let open = $state(false);
	let value = $state('');
	let inputElement = $state<HTMLIonInputElement>();

	async function onConfirmMap(): Promise<void> {
		value = cachedLocation;
		inputElement!.value = value;
		inputElement?.dispatchEvent(new CustomEvent('ionInput', { bubbles: true }));
		open = false;
	}

	function onDismissMap(): void {
		open = false;
	}
</script>

<TextInputItem
	inputElement={(value) => (inputElement = value)}
	{value}
	{name}
	{label}
	{icon}
	inputIcon={mapOutline}
	inputIconClicked={() => (open = true)}
/>

<Modal
	{open}
	informational={!cachedLocation}
	confirmLabel={$t('routes.organization.page.activity.map-modal.button.confirm')}
	dismissed={onDismissMap}
	confirmed={onConfirmMap}
	initialBreakPoint={1}
	breakpoints={false}
>
	{#if open}
		<LeafletMap
			value={inputElement?.value as string}
			selected={(location) => (cachedLocation = location)}
			classList="-m-4"
		/>
	{/if}
</Modal>
