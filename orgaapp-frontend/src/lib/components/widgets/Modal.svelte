<script lang="ts">
	import type { Snippet } from 'svelte';

	import IonButton from './Button.svelte';

	import { t } from '$lib/locales';

	let {
		title,
		children,
		open = false
	}: { title?: string; children: Snippet; open?: boolean } = $props();

	function cancel() {
		console.log('Cancel');
	}

	function confirm() {
		console.log('Confirm');
	}
</script>

<ion-modal is-open={open}>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<IonButton onClick={cancel}>{$t('components.widgets.modal.button.cancel')}</IonButton>
			</ion-buttons>
			<ion-title class="text-center">{title}</ion-title>
			<ion-buttons slot="end">
				<IonButton onClick={confirm}>
					{$t('components.widgets.modal.button.confirm')}
				</IonButton>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
