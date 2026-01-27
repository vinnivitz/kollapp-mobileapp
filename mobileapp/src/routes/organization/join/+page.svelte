<script lang="ts">
	import type { OrganizationMinifiedTO } from '@kollapp/api-types';

	import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
	import { Haptics } from '@capacitor/haptics';
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { joinOrganizationSchema } from '$lib/api/schema/organization';
	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, informationModal, showAlert, StatusCheck, withLoader } from '$lib/utility';

	const form = new Form({
		completed: async ({ response }) => await onCompleted(response),
		request: organizationService.joinByInvitationCode,
		schema: joinOrganizationSchema()
	});

	async function onCodeScan(): Promise<void> {
		try {
			const result = await CapacitorBarcodeScanner.scanBarcode({ hint: CapacitorBarcodeScannerTypeHint.QR_CODE });
			const code = result.ScanResult;
			if (code.length === 8) {
				const response = await withLoader(() => organizationService.joinByInvitationCode({ code }));
				if (StatusCheck.isOK(response.status)) {
					await Haptics.vibrate({ duration: 1000 });
					await onCompleted(response.data);
				}
			} else {
				await showAlert($t('routes.organization.join.page.qr-code.invalid'));
			}
		} catch (error) {
			if (dev) console.info('Error scanning QR code:', error);
		}
	}

	async function onCompleted(organization: OrganizationMinifiedTO): Promise<void> {
		await organizationStore.initialize();
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
