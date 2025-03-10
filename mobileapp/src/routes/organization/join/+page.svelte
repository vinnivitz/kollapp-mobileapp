<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, qrCodeOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { registerOrganizationSchema, type RegisterOrganizationDto } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, getValidationResult, showAlert } from '$lib/utils';

	const model = registerOrganizationSchema().cast({}) as RegisterOrganizationDto;
	let actions: FormActions<RegisterOrganizationDto>;
	let touched = $state(false);

	const config: FormConfig<RegisterOrganizationDto> = {
		schema: registerOrganizationSchema(),
		onSubmit,
		onTouched: () => (touched = true),
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterOrganizationDto, validationResult: ValidationResult): Promise<void> {
		validationResult = validationResult;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(await organizationResource.create(model));
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
				organizationStore.init();
				await goto(PageRoute.HOME);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}

	async function onCodeScan() {
		showAlert('Feature not implemented yet');
	}
</script>

<Layout title={$t('routes.organization.page.join.title')} showBackButton>
	<Card title={$t('routes.orgnization.page.join.form.title')}>
		<form use:customForm={form}>
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
					classProp="mt-3"
					expand="block"
					type="submit"
					label={$t('routes.organization.page.join.form.submit')}
					iconSrc={saveOutline}
					disabled={!touched}
				/>
			</div>
		</form>
	</Card>
</Layout>
