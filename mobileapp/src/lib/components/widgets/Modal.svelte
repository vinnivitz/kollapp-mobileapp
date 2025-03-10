<script lang="ts">
	import type { Snippet } from 'svelte';

	import Button from './Button.svelte';

	import { t } from '$lib/locales';
	import { clickableElement } from '$lib/utils';

	let {
		title,
		children,
		open = false,
		cancel,
		confirm
	}: {
		title?: string;
		children: Snippet;
		open?: boolean;
		cancel?: () => void;
		confirm?: () => void;
	} = $props();
</script>

<ion-modal is-open={open}>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<Button color="light" label={$t('components.widgets.modal.button.cancel')} click={() => cancel?.()}></Button>
			</ion-buttons>
			<ion-title class="text-center">{title}</ion-title>
			<ion-buttons slot="end">
				<ion-button use:clickableElement={() => confirm?.()}>
					{$t('components.widgets.modal.button.confirm')}
				</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
