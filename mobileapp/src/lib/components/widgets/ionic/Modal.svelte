<script lang="ts">
	import { saveOutline, trashBinOutline } from 'ionicons/icons';
	import { type Snippet } from 'svelte';

	import Button from './Button.svelte';

	import { t } from '$lib/locales';

	type Properties = {
		children: Snippet;
		cancelLabel?: string;
		confirmLabel?: string;
		open?: boolean;
		cancel?: () => void;
		confirm?: () => void;
		dismissed?: () => void;
	};

	let {
		cancel,
		cancelLabel = $t('components.widgets.modal.button.cancel'),
		children,
		confirm,
		confirmLabel = $t('components.widgets.modal.button.confirm'),
		dismissed,
		open = false
	}: Properties = $props();

	const observer = new MutationObserver(() => patchIonSelect());
	observer.observe(document.body, { childList: true, subtree: true });

	function patchIonSelect(): void {
		for (const select of document.querySelectorAll('ion-select')) {
			const shadowRoot = select.shadowRoot;
			if (shadowRoot) {
				const wrapper = shadowRoot.querySelector('.select-wrapper') as HTMLLabelElement;
				if (wrapper) {
					wrapper.style.justifyContent = 'center';
				}
			}
		}
	}
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-modal
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
						cancel?.();
					}}
					icon={trashBinOutline}
				/>
			</ion-buttons>
			<ion-buttons slot="end">
				<Button label={confirmLabel} color="white" click={() => confirm?.()} icon={saveOutline} />
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-modal>
