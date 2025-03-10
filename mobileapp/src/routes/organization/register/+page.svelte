<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { saveOutline } from 'ionicons/icons';

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
	import { customForm, getValidationResult } from '$lib/utils';

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

	async function onSubmit(model: RegisterOrganizationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			result = getValidationResult(await organizationResource.create(model));
			await loader.dismiss();
			if (result.valid) {
				actions.resetModel();
				await organizationStore.init();
				goto(PageRoute.ORGANIZATION.ROOT);
			} else {
				actions.applyValidationFeedback(result);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.register.organization.title')} showBackButton>
	<Card title={$t('routes.auth.register.organization.form.title')}>
		<form use:customForm={form}>
			<InputItem name="name" label={$t('routes.auth.register.organization.form.input.name')} />
			<div class="text-center">
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					label={$t('routes.auth.register.organization.form.submit')}
					iconSrc={saveOutline}
					disabled={!touched}
				/>
			</div>
		</form>
	</Card>
</Layout>
