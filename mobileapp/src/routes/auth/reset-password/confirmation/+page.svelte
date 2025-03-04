<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	import { apiResources } from '$lib/api';
	import { resetPasswordSchema, type ResetPasswordDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm, showAlert } from '$lib/utils';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		if (!data.token) {
			showAlert($t('routes.auth.reset-password.confirmation.no-token'));
			goto(PageRoute.AUTH.LOGIN);
		}
	});

	const model = resetPasswordSchema().cast({}) as ResetPasswordDto;
	let validationResult: ValidationResult;
	let actions: FormActions<ResetPasswordDto>;
	let touched = $state(false);

	const config: FormConfig<ResetPasswordDto> = {
		schema: resetPasswordSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: ResetPasswordDto, result: ValidationResult): Promise<void> {
		touched = true;
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			delete model.confirmPassword;
			validationResult = getValidationResult(
				await apiResources.publicUser.resetPassword(model, data.token!)
			);
			if (validationResult.valid) {
				await goto(PageRoute.AUTH.LOGIN);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.auth.reset-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.password')}
				iconSrc={keyOutline}
			/>
			<InputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				iconSrc={keySharp}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.confirmation.form.submit')}
				disabled={!touched}
			/>
		</form>
	</Card>
</Layout>
