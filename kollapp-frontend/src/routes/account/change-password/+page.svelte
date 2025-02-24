<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { changePasswordSchema, type ChangePasswordDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm } from '$lib/utils';

	const model = changePasswordSchema().cast({}) as ChangePasswordDto;
	let validationResult: ValidationResult;
	let actions: FormActions<ChangePasswordDto>;
	let touched = false;
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
		touched = true;
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
			if (touched) {
				const result = confirmPasswordValidator();
				actions.applyValidationFeedbackByKey('confirmNewPassword', result);
			}
		}
	}

	function updateConfirmPassword(value: string): void {
		confirmPassword = value;
		if (touched) {
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

<IonLayout title={$t('routes.auth.reset-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input
					name="currentPassword"
					label={$t('routes.account.change-password.form.input.current-password')}
				></ion-input>
			</ion-item>
			<ion-item>
				<ion-input
					name="newPassword"
					label={$t('routes.account.change-password.form.input.new-password')}
				></ion-input>
			</ion-item>
			<ion-item>
				<!-- svelte-ignore event_directive_deprecated -->
				<ion-input
					name="confirmNewPassword"
					type="password"
					value={confirmPassword}
					on:ionInput={(event) => updateConfirmPassword(event.detail.value || '')}
					label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				>
				</ion-input>
			</ion-item>
			<ion-button class="mt-3" expand="block" type="submit">
				{$t('routes.account.change-password.form.submit')}
			</ion-button>
		</form>
	</Card>
</IonLayout>
