<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { saveOutline, trashBinOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import {
		registerOrganizationSchema,
		type RegisterOrganizationDto
	} from '$lib/api/dto/client/organization';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { authenticationStore, organizationStore } from '$lib/store';
	import { customForm, showAlert } from '$lib/utils';

	let canceled = false;

	$effect(() => {
		if (!$authenticationStore) {
			if (!canceled) {
				showAlert($t('routes.auth.register-organization.not-authenticated'));
			}
			goto(PageRoute.AUTH.LOGIN);
		}
	});

	const model = registerOrganizationSchema().cast({}) as RegisterOrganizationDto;
	let validationResult: ValidationResult;
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

	async function onCancel(): Promise<void> {
		canceled = true;
		await apiResources.auth.logout();
	}
</script>

<Layout title={$t('routes.auth.register.organization.title')} hideLayout>
	<div class="mb-6">
		<Welcome />
	</div>
	<Card title={$t('routes.auth.register.organization.form.title')}>
		<form use:customForm={form}>
			<InputItem name="name" label={$t('routes.auth.register.organization.form.input.name')} />
			<div class="flex gap-2">
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					label={$t('routes.auth.register.organization.form.submit')}
					iconSrc={saveOutline}
					disabled={!touched}
				/>
				<Button
					color="danger"
					classProp="mt-3"
					expand="block"
					label={$t('routes.auth.register.organization.form.cancel')}
					iconSrc={trashBinOutline}
					click={onCancel}
				/>
			</div>
		</form>
	</Card>
</Layout>
