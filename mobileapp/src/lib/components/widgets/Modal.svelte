<script lang="ts">
	import { saveOutline, trashBinOutline } from 'ionicons/icons';
	import type { Snippet } from 'svelte';

	import Button from './Button.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		cancel?: () => void;
		cancelLabel?: string;
		children: Snippet;
		confirm?: () => void;
		confirmLabel?: string;
		open?: boolean;
	};

	let {
		cancel,
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirm,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		open = false
	}: Properties = $props();
</script>

<ion-modal is-open={open}>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<Button label={cancelLabel} color="light" click={() => cancel?.()} icon={trashBinOutline} />
			</ion-buttons>
			<ion-buttons slot="end">
				<Button label={confirmLabel} color="light" click={() => confirm?.()} icon={saveOutline} />
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
