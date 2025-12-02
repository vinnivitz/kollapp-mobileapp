<script lang="ts">
	import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
	import { Haptics } from '@capacitor/haptics';
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import { joinOrganizationSchema } from '$lib/api/validation/organization/join-organization.validation';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, informationModal, showAlert, StatusCheck } from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) => await onCompleted(model.code),
		request: async (model) => organizationService.joinByInvitationCode(model.code),
		schema: joinOrganizationSchema()
	});

	async function onCodeScan(): Promise<void> {
		try {
			const result = await CapacitorBarcodeScanner.scanBarcode({ hint: CapacitorBarcodeScannerTypeHint.QR_CODE });
			const code = result.ScanResult;
			if (code.length === 8) {
				const response = await organizationService.joinByInvitationCode(code);
				if (StatusCheck.isOK(response.status)) {
					await Haptics.vibrate({ duration: 1000 });
					await onCompleted(code);
				}
			} else {
				await showAlert($t('routes.organization.join.page.qr-code.invalid'));
			}
		} catch (error) {
			console.error('Error scanning QR code:', error);
			await showAlert($t('routes.organization.join.page.qr-code.error'));
		}
	}

	async function onCompleted(code: string): Promise<void> {
		await organizationStore.init();
		const organizationResponse = await organizationService.getByInvitationCode(code);
		if (!StatusCheck.isOK(organizationResponse.status)) return;
		const organization = organizationResponse.data;
		await informationModal(
			$t('routes.organization.join.page.modal.join.header'),
			$t('routes.organization.join.page.modal.join.message', { value: organization.name })
		);
		return goto(resolve('/organization'));
	}
</script>

<Layout title={$t('routes.organization.join.page.title')} showBackButton>
	{@render joinOrganizationCard()}
</Layout>

<!-- Snippets -->

{#snippet joinOrganizationCard()}
	<Card title={$t('routes.organization.join.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				uppercase
				maxlength={8}
				name="code"
				label={$t('routes.organization.join.page.card.form.code')}
				helperText={$t('routes.organization.join.page.card.form.helper-text')}
				icon={keyOutline}
				inputIcon={qrCodeOutline}
				inputIconClicked={onCodeScan}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.organization.join.page.card.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
{/snippet}
