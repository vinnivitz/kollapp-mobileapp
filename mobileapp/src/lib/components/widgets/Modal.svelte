<script lang="ts">
	import type { Snippet } from 'svelte';

	import { saveOutline, trashBinOutline } from 'ionicons/icons';

	import Button from './Button.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		children: Snippet;
		cancelLabel?: string;
		confirmLabel?: string;
		open?: boolean;
		cancel?: () => void;
		confirm?: () => void;
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
				<Button
					label={cancelLabel}
					color="light"
					click={() => {
						open = false;
						cancel?.();
					}}
					icon={trashBinOutline}
				/>
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
