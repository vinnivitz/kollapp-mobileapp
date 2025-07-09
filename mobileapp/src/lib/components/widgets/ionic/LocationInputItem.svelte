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
		value?: string;
	};

	let { icon = locationOutline, label, name, value }: Properties = $props();

	let cachedLocation = $state('');
	let open = $state(false);

	async function onConfirmMap(): Promise<void> {
		value = cachedLocation;
		open = false;
	}
</script>

<TextInputItem {value} {name} {label} {icon} inputIcon={mapOutline} inputIconClick={() => (open = true)} />

<Modal
	{open}
	confirmLabel={$t('routes.organization.page.activity.map-modal.button.confirm')}
	confirm={onConfirmMap}
	cancelLabel={$t('routes.organization.page.activity.map-modal.button.cancel')}
>
	{#if open}
		<LeafletMap selected={(location) => (cachedLocation = location)} classList="-m-4" />
	{/if}
</Modal>
