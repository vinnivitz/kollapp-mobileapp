<script lang="ts">
	import { getPlatforms } from '@ionic/core';
	import { modalController } from 'ionic-svelte';
	import { saveOutline, trashBinOutline } from 'ionicons/icons';
	import { onDestroy, type Snippet } from 'svelte';

	import Button from './Button.svelte';

	import { t } from '$lib/locales';
	import { modalStore } from '$lib/stores';

	type Properties = {
		children: Snippet;
		open: boolean;
		cancelLabel?: string;
		confirmLabel?: string;
		confirm?: () => void;
		dismissed?: () => void;
	};

	let {
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirm,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		dismissed,
		open
	}: Properties = $props();

	let _modalController = $state<HTMLIonModalElement | undefined>();

	$effect(() => {
		if (!_modalController) return;
		if (open) {
			modalStore.add(_modalController);
		} else {
			modalStore.remove(_modalController);
		}
	});

	function isPlatformWeb(): boolean {
		return getPlatforms().includes('mobileweb') || getPlatforms().includes('desktop');
	}

	async function onDismiss(): Promise<void> {
		open = false;
		dismissed?.();
	}

	onDestroy(async () => {
		if (!isPlatformWeb()) return;
		const controller = await modalController.getTop();
		if (controller && controller === _modalController) {
			try {
				await _modalController.dismiss();
			} catch {
				return;
			}
		}
	});
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-modal bind:this={_modalController} is-open={open} on:didDismiss={dismissed}>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<Button type="button" label={cancelLabel} color="white" click={onDismiss} icon={trashBinOutline} />
			</ion-buttons>
			{#if !!confirm}
				<ion-buttons slot="end">
					<Button type="button" label={confirmLabel} color="white" click={confirm} icon={saveOutline} />
				</ion-buttons>
			{/if}
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
