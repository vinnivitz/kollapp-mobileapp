<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type ChangePasswordDto, changePasswordSchema } from '$lib/api/dto/client/user';
	import { userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import {
		customForm,
		getValidationResult,
		isBiometricAvailable,
		isBiometricEnabled,
		updatePasswordBiometricCredentials
	} from '$lib/utility';

	const model = changePasswordSchema().cast({}) as ChangePasswordDto;
	let validationResult: ValidationResult;
	let actions: FormActions<ChangePasswordDto>;
	let touched = $state(false);

	const config: FormConfig<ChangePasswordDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: changePasswordSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: ChangePasswordDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			delete model.confirmNewPassword;
			validationResult = getValidationResult(await userResource.changePassword(model));
			if (validationResult.valid) {
				if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
					await updatePasswordBiometricCredentials(model.newPassword);
				}
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
				icon={keyOutline}
			/>
			<InputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.new-password')}
				icon={keySharp}
			/>
			<InputItem
				name="confirmNewPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.change-password.form.submit')}
				icon={saveOutline}
				disabled={!touched}
			/>
		</form>
	</Card>
</Layout>
