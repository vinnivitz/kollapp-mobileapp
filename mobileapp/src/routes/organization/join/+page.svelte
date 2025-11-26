<script lang="ts">
	import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
	import { Haptics } from '@capacitor/haptics';
	import { alertController } from '@ionic/core';
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import { joinOrganizationSchema } from '$lib/api/validation/organization/join-organization.validation';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, showAlert, StatusCheck } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(resolve('/organization')),
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
					await organizationStore.update(response.data.id);
					const alert = await alertController.create({
						buttons: ['Ok'],
						header: `Join request sent`,
						message: `Your request to join ${response.data.name} has been sent. You will be notified once it is approved.`
					});
					await alert.present();
					await alert.onDidDismiss();
					return goto(resolve('/organization'));
				}
			} else {
				await showAlert('QR code is not valid.');
			}
		} catch (error) {
			console.error('Error scanning QR code:', error);
			await showAlert('An error occurred while scanning the QR code. Please try again.');
		}
	}
</script>

<Layout title={$t('routes.organization.page.join.title')} showBackButton>
	<Card title={$t('routes.organization.page.join.form.title')}>
		<form use:customForm={form}>
			<TextInputItem
				uppercase
				maxlength={8}
				name="code"
				label={$t('routes.organization.page.join.form.code')}
				helperText="Get it from a collective admin."
				icon={keyOutline}
				inputIcon={qrCodeOutline}
				inputIconClicked={onCodeScan}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.organization.page.join.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
