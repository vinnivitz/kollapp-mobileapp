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
		cancelLabel?: string;
		confirmLabel?: string;
		isOpen?: boolean;
		confirm?: () => void;
		dismissed?: () => void;
	};

	let {
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirm,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		dismissed,
		isOpen: open = false
	}: Properties = $props();

	let modal: HTMLIonModalElement | undefined;

	$effect(() => {
		if (!modal) return;
		if (open) {
			modalStore.add(modal);
		} else {
			modalStore.remove(modal);
		}
	});

	function isPlatformWeb(): boolean {
		return getPlatforms().includes('mobileweb') || getPlatforms().includes('desktop');
	}

	onDestroy(async () => {
		if (!isPlatformWeb()) return;
		const controller = await modalController.getTop();
		if (controller) {
			try {
				await controller.dismiss();
			} catch {
				return;
			}
		}
	});
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-modal
	bind:this={modal}
	is-open={open}
	on:didDismiss={() => {
		open = false;
		dismissed?.();
	}}
>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<Button
					label={cancelLabel}
					color="white"
					click={() => {
						open = false;
						dismissed?.();
					}}
					icon={trashBinOutline}
				/>
			</ion-buttons>
			{#if !!confirm}
				<ion-buttons slot="end">
					<Button label={confirmLabel} color="white" click={() => confirm?.()} icon={saveOutline} />
				</ion-buttons>
			{/if}
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
