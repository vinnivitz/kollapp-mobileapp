<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { accessibilityOutline } from 'ionicons/icons';

	import { apiResources } from '$lib/api';
	import { updateOrganizationSchema, type UpdateOrganizationDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import type { OrganizationModel } from '$lib/models/store';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/store';
	import { customForm } from '$lib/utils';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);
	const loading = $derived<boolean>(!organizationModel);
	let validationResult: ValidationResult;
	let actions: FormActions<UpdateOrganizationDto>;
	let model: UpdateOrganizationDto;
	let form = $state<Form<UpdateOrganizationDto>>();
	let touched = $state(false);

	const config: FormConfig<UpdateOrganizationDto> = {
		schema: updateOrganizationSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions),
		onTouched: () => (touched = true)
	};

	$effect(() => {
		if (organizationModel) {
			model = updateOrganizationSchema().cast({
				name: organizationModel.name
			}) as UpdateOrganizationDto;

			form = new Form(model, config);
		}
	});

	async function onSubmit(model: UpdateOrganizationDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(
				await apiResources.organization.updateOrganization(model)
			);
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
				touched = false;
				organizationStore.init();
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}
</script>

<Layout title={$t('routes.organization.update-info.title')} showBackButton {loading}>
	{#if form}
		<Card title={$t('routes.organization.update-info.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="name"
					label={$t('routes.auth.register.organization.form.input.name')}
					iconSrc={accessibilityOutline}
				/>
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.organization.update-info.card.button')}
				/>
			</form>
		</Card>
	{/if}
</Layout>
