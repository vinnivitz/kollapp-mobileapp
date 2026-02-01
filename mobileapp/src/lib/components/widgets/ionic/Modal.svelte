<script lang="ts">
	import { Device } from '@capacitor/device';
	import { modalController } from '@ionic/core';
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
		classList?: string;
		confirmIcon?: string;
		confirmLabel?: string;
		informational?: boolean;
		initialBreakPoint?: number;
		labels?: boolean;
		lazy?: boolean;
		loading?: boolean;
		title?: string;
		touched?: boolean;
		confirmed?: () => void;
		dismissed?: () => void;
		presented?: () => void;
	};

	let {
		breakpoints = true,
		cancelIcon = trashBinOutline,
		cancelLabel = $t('components.widgets.ionic.modal.cancel'),
		children,
		classList = '',
		confirmed,
		confirmIcon = saveOutline,
		confirmLabel = $t('components.widgets.ionic.modal.confirm'),
		dismissed,
		informational,
		initialBreakPoint = 0.75,
		labels = true,
		lazy = false,
		loading = false,
		open,
		presented,
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

		return () => {
			if (_modalController) {
				modalStore.remove(_modalController);
			}
		};
	});

	async function isPlatformWeb(): Promise<boolean> {
		const deviceInfo = await Device.getInfo();
		return deviceInfo.platform === 'web';
	}

	async function onDismiss(): Promise<void> {
		await _modalController?.dismiss();
		open = false;
	}

	async function onConfirm(): Promise<void> {
		_modalController?.querySelector('form')?.requestSubmit();
		confirmed?.();
	}

	function onPresent(): void {
		if (!$modalStore) return;
		for (const modal of $modalStore) {
			if (modal !== _modalController) {
				modal.setCurrentBreakpoint(1);
			}
		}
	}

	onDestroy(async () => {
		if (!(await isPlatformWeb())) return;
		const controller = await modalController.getTop();
		if (controller && controller === _modalController) {
			try {
				await _modalController?.dismiss();
			} catch {
				return;
			}
		}
	});
</script>

{#if (lazy && open) || !lazy}
	<ion-modal
		class={classList}
		bind:this={_modalController}
		is-open={open}
		onwillPresent={onPresent}
		ondidPresent={presented}
		ondidDismiss={dismissed}
		breakpoints={breakpoints ? [0, 0.5, 0.75, 1] : undefined}
		initial-breakpoint={initialBreakPoint}
		handle-behavior="cycle"
		role="dialog"
		aria-modal="true"
		aria-label={title}
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
							aria-label={$t('accessibility.modal.close')}
							onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && onDismiss()}
							onclick={onDismiss}
						>
							<ion-back-button default-href="/" aria-label={$t('accessibility.modal.close')}></ion-back-button>
						</ion-button>
					</ion-buttons>
				{:else}
					<ion-buttons slot="start">
						<Button
							type="button"
							label={labels ? cancelLabel : ''}
							color="white"
							clicked={onDismiss}
							icon={cancelIcon}
							ariaLabel={cancelLabel}
						/>
					</ion-buttons>
					<ion-buttons slot="end">
						<Button
							disabled={!touched}
							type="button"
							label={labels ? confirmLabel : ''}
							color="white"
							clicked={onConfirm}
							icon={confirmIcon}
							ariaLabel={confirmLabel}
						/>
					</ion-buttons>
				{/if}
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			{#if !loading}
				{@render children?.()}
			{:else}
				<div class="flex h-full items-start justify-center">
					<ion-spinner name="crescent"></ion-spinner>
				</div>
			{/if}
		</ion-content>
	</ion-modal>
{/if}
