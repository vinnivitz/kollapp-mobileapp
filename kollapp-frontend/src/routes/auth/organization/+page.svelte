<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { registerOrganizationSchema, type RegisterOrganizationDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/store';
	import { customForm } from '$lib/utils';

	const model = registerOrganizationSchema().cast({}) as RegisterOrganizationDto;
	let validationResult: ValidationResult;
	let actions: FormActions<RegisterOrganizationDto>;

	const config: FormConfig<RegisterOrganizationDto> = {
		schema: registerOrganizationSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterOrganizationDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(
				await apiResources.organization.createOrganization(model)
			);
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
</script>

<IonLayout title={$t('routes.auth.register.organization.title')} showBackButton>
	<Card title={$t('routes.auth.register.organization.form.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="name" label={$t('routes.auth.register.organization.form.input.name')}
				></ion-input>
			</ion-item>
			<ion-button class="mt-3" expand="block" type="submit">
				{$t('routes.auth.register.organization.form.submit')}
			</ion-button>
		</form>
	</Card>
</IonLayout>
