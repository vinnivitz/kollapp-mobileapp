<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp } from 'ionicons/icons';

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
	let submitted = false;
	let newPassword: string;
	let confirmPassword = $state<string>();

	const config: FormConfig<ChangePasswordDto> = {
		schema: changePasswordSchema(),
		onSubmit,
		onChange,
		exposedActions: (exposedActions) => (actions = exposedActions),
		customValidators: [confirmPasswordValidator]
	};

	const form = new Form(model, config);

	async function onSubmit(model: ChangePasswordDto, result: ValidationResult): Promise<void> {
		submitted = true;
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(await apiResources.user.changePassword(model));
			if (validationResult.valid) {
				await goto(PageRoute.ACCOUNT.ROOT);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}

	function onChange(key: string, value: string | number): void {
		if (key === 'newPassword') {
			newPassword = value as string;
			if (submitted) {
				const result = confirmPasswordValidator();
				actions.applyValidationFeedbackByKey('confirmNewPassword', result);
			}
		}
	}

	function updateConfirmPassword(value: string): void {
		confirmPassword = value;
		if (submitted) {
			const result = confirmPasswordValidator();
			actions.applyValidationFeedbackByKey('confirmNewPassword', result);
		}
	}

	function confirmPasswordValidator(): ValidationResult {
		return newPassword === confirmPassword
			? { valid: true }
			: {
					valid: false,
					errors: [
						{
							field: 'confirmNewPassword',
							message: $t('api.dto.reset-password.schema.validation.confirm-password.no-match')
						}
					]
				};
	}
</script>

<Layout title={$t('routes.auth.change-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.change-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="currentPassword"
				label={$t('routes.account.change-password.form.input.current-password')}
				iconSrc={keyOutline}
			/>
			<InputItem
				name="newPassword"
				label={$t('routes.account.change-password.form.input.new-password')}
				iconSrc={keySharp}
			/>
			<InputItem
				name="confirmNewPassword"
				type="password"
				value={confirmPassword}
				change={updateConfirmPassword}
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				iconSrc={keySharp}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.change-password.form.submit')}
			/>
		</form>
	</Card>
</Layout>
