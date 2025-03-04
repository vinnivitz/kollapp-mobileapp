<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { changePasswordSchema, type ChangePasswordDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm } from '$lib/utils';

	const model = changePasswordSchema().cast({}) as ChangePasswordDto;
	let validationResult: ValidationResult;
	let actions: FormActions<ChangePasswordDto>;
	let touched = $state(false);

	const config: FormConfig<ChangePasswordDto> = {
		schema: changePasswordSchema(),
		onSubmit,
		onTouched: () => (touched = true),
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: ChangePasswordDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			delete model.confirmNewPassword;
			validationResult = getValidationResult(await apiResources.user.changePassword(model));
			if (validationResult.valid) {
				await goto(PageRoute.ACCOUNT.ROOT);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.auth.change-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.change-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="currentPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.current-password')}
				iconSrc={keyOutline}
			/>
			<InputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.new-password')}
				iconSrc={keySharp}
			/>
			<InputItem
				name="confirmNewPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				iconSrc={keySharp}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.change-password.form.submit')}
				iconSrc={saveOutline}
				disabled={!touched}
			/>
		</form>
	</Card>
</Layout>
