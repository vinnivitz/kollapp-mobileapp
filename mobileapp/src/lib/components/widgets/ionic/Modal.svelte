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
		cancelIcon?: string;
		cancelLabel?: string;
		confirmLabel?: string;
		informational?: boolean;
		touched?: boolean;
		confirmed?: () => void;
		dismissed?: () => void;
	};

	let {
		cancelIcon,
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirmed,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		dismissed,
		informational,
		open,
		touched = true
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

	async function onConfirm(): Promise<void> {
		_modalController?.querySelector('form')?.requestSubmit();
		confirmed?.();
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
			{#if informational}
				<ion-buttons slot="start">
					<ion-button
						role="button"
						tabindex="0"
						on:keydown={(_event) => _event.key === 'Enter' && onDismiss()}
						on:click={onDismiss}
					>
						<ion-back-button default-href="/"></ion-back-button>
					</ion-button>
				</ion-buttons>
			{:else}
				<ion-buttons slot="start">
					<Button
						type="button"
						label={cancelLabel}
						color="white"
						clicked={onDismiss}
						icon={cancelIcon ?? trashBinOutline}
					/>
				</ion-buttons>
				{#if !!confirm}
					<ion-buttons slot="end">
						<Button
							disabled={!touched}
							type="button"
							label={confirmLabel}
							color="white"
							clicked={onConfirm}
							icon={saveOutline}
						/>
					</ion-buttons>
				{/if}
			{/if}
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
