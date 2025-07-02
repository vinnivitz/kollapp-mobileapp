<script lang="ts">
	import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
	import { Haptics } from '@capacitor/haptics';
	import { alertController } from 'ionic-svelte';
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';
	import { showAlert, StatusCheck } from '$lib/utility';

	async function onCodeScan(): Promise<void> {
		const result = await CapacitorBarcodeScanner.scanBarcode({ hint: CapacitorBarcodeScannerTypeHint.QR_CODE });
		const code = result.ScanResult;
		if (code.length === 8) {
			const response = await organizationResource.joinOrganizationByInvitationCode(code);
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
				return goto(PageRoute.ORGANIZATION.ROOT);
			}
		} else {
			showAlert('QR code is not valid.');
		}
	}
</script>

<Layout title={$t('routes.organization.page.join.title')} showBackButton>
	<Card title={$t('routes.organization.page.join.form.title')}>
		<form>
			<InputItem
				name="code"
				label={$t('routes.organization.page.join.form.code')}
				helperText="Get it from a collective admin."
				icon={keyOutline}
				inputIcon={qrCodeOutline}
				inputIconClick={onCodeScan}
			/>
			<div class="text-center">
				<Button
					classList="mt-3"
					expand="block"
					type="submit"
					label={$t('routes.organization.page.join.form.submit')}
					icon={saveOutline}
				/>
			</div>
		</form>
	</Card>
</Layout>
