<script lang="ts">
	import { locationOutline, mapOutline } from 'ionicons/icons';

	import InputItem from './InputItem.svelte';
	import Modal from './Modal.svelte';
	import LeafletMap from '../LeafletMap.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		label: string;
		name: string;
		value?: string;
		selected?: (value: string) => void;
	};

	let { label, name, selected, value }: Properties = $props();

	let cachedLocation = $state('');
	let open = $state(false);

	async function onConfirmMap(): Promise<void> {
		selected?.(cachedLocation);
		value = cachedLocation;
		open = false;
	}
</script>

<InputItem {value} {name} {label} icon={locationOutline} inputIcon={mapOutline} inputIconClick={() => (open = true)} />

<Modal
	{open}
	confirmLabel={$t('routes.organization.page.activity.map-modal.button.confirm')}
	confirm={onConfirmMap}
	cancelLabel={$t('routes.organization.page.activity.map-modal.button.cancel')}
>
	<LeafletMap selected={(location) => (cachedLocation = location)} classList="-m-4" />
</Modal>
