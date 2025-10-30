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
		breakpoints?: boolean;
		cancelIcon?: string;
		cancelLabel?: string;
		confirmIcon?: string;
		confirmLabel?: string;
		informational?: boolean;
		initialBreakPoint?: number;
		lazy?: boolean;
		title?: string;
		touched?: boolean;
		confirmed?: () => void;
		dismissed?: () => void;
	};

	let {
		breakpoints = true,
		cancelIcon = trashBinOutline,
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirmed,
		confirmIcon = saveOutline,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		dismissed,
		informational,
		initialBreakPoint = 0.75,
		lazy = false,
		open,
		title,
		touched = true
	}: Properties = $props();

	let _modalController = $state<HTMLIonModalElement>();

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

	function onPresent(): void {
		if ($modalStore)
			for (const modal of $modalStore) {
				if (modal !== _modalController) {
					modal.setCurrentBreakpoint(1);
				}
			}
	}

	onDestroy(async () => {
		if (!isPlatformWeb()) return;
		const self = _modalController;
		const controller = await modalController.getTop();
		if (controller && controller === self) {
			try {
				await self?.dismiss();
			} catch {
				return;
			}
		}
	});
</script>

{#if (lazy && open) || !lazy}
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-modal
		bind:this={_modalController}
		is-open={open}
		on:willPresent={onPresent}
		on:didDismiss={dismissed}
		breakpoints={breakpoints ? [0, 0.5, 0.75, 1] : undefined}
		initial-breakpoint={initialBreakPoint}
		handle-behavior="cycle"
	>
		<ion-header>
			<ion-toolbar>
				{#if title}
					<ion-title>{title}</ion-title>
				{/if}
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
						<Button type="button" label={cancelLabel} color="white" clicked={onDismiss} icon={cancelIcon} />
					</ion-buttons>
					<ion-buttons slot="end">
						<Button
							disabled={!touched}
							type="button"
							label={confirmLabel}
							color="white"
							clicked={onConfirm}
							icon={confirmIcon}
						/>
					</ion-buttons>
				{/if}
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			{@render children?.()}
		</ion-content>
	</ion-modal>
{/if}
