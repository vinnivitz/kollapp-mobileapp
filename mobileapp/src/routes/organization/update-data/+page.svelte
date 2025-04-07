<script lang="ts">
	import type { OrganizationModel } from '$lib/models/models';

	import { loadingController } from 'ionic-svelte';
	import { accessibilityOutline, saveOutline } from 'ionicons/icons';

	import { type UpdateOrganizationDto, updateOrganizationSchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, getValidationResult } from '$lib/utility';

	const organization = $derived<OrganizationModel | undefined>($organizationStore);
	let actions: FormActions<UpdateOrganizationDto>;
	let model: UpdateOrganizationDto;
	let form = $state<Form<UpdateOrganizationDto>>();
	let touched = $state(false);

	const config: FormConfig<UpdateOrganizationDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: updateOrganizationSchema()
	};

	$effect(() => {
		if (organization) {
			model = updateOrganizationSchema().cast({
				name: organization.name
			}) as UpdateOrganizationDto;

			form = new Form(model, config);
		}
	});

	async function onSubmit(model: UpdateOrganizationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			result = getValidationResult(await organizationResource.update(organization!.id, model));
			await loader.dismiss();
			if (result.valid) {
				actions.resetModel();
				touched = false;
				organizationStore.init();
			} else {
				actions.applyValidationFeedback(result);
			}
		}
	}
</script>

<Layout title={$t('routes.organization.update-info.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.organization.update-info.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="name"
					label={$t('routes.auth.register.organization.form.input.name')}
					icon={accessibilityOutline}
				/>
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.organization.update-info.card.button')}
					icon={saveOutline}
				/>
			</form>
		</Card>
	{/if}
</Layout>
