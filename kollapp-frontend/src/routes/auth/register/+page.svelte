<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { registerSchema, type RegisterDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { type ValidationResult, type FormActions, type FormConfig, Form } from '$lib/models/ui';
	import { clickableElement, customForm } from '$lib/utils';

	const model = registerSchema().cast({}) as RegisterDto;
	let validationResult: ValidationResult;
	let actions: FormActions<RegisterDto>;
	let touched = false;
	let password: string;
	let confirmPassword = $state<string>();

	const config: FormConfig<RegisterDto> = {
		schema: registerSchema(),
		onSubmit,
		onChange,
		exposedActions: (exposedActions) => (actions = exposedActions),
		customValidators: [confirmPasswordValidator]
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterDto, result: ValidationResult): Promise<void> {
		touched = true;
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(await apiResources.publicUser.registerManager(model));
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
				confirmPassword = '';
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}

	function onChange(key: string, value: string | number): void {
		if (key === 'password') {
			password = value as string;
			if (touched) {
				const result = confirmPasswordValidator();
				actions.applyValidationFeedbackByKey('confirmPassword', result);
			}
		}
	}

	function updateConfirmPassword(value: string): void {
		confirmPassword = value;
		if (touched) {
			const result = confirmPasswordValidator();
			actions.applyValidationFeedbackByKey('confirmPassword', result);
		}
	}

	function confirmPasswordValidator(): ValidationResult {
		return password === confirmPassword
			? { valid: true }
			: {
					valid: false,
					errors: [
						{
							field: 'confirmPassword',
							message: $t('api.dto.register.schema.validation.confirm-password.no-match')
						}
					]
				};
	}
</script>

<IonLayout title={$t('routes.auth.register.title')} hideLayout>
	<div class="mb-6">
		<Welcome></Welcome>
	</div>
	<Card>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="surname" label={$t('routes.auth.register.form.input.surname')}></ion-input>
			</ion-item>
			<ion-item>
				<ion-input name="name" label={$t('routes.auth.register.form.input.name')}></ion-input>
			</ion-item>
			<ion-item>
				<ion-input name="username" label={$t('routes.auth.register.form.input.username')}
				></ion-input>
			</ion-item>
			<ion-item>
				<ion-input name="email" type="email" label={$t('routes.auth.register.form.input.email')}>
				</ion-input>
			</ion-item>
			<ion-item>
				<ion-input
					name="password"
					type="password"
					label={$t('routes.auth.register.form.input.password')}
				>
				</ion-input>
			</ion-item>
			<ion-item>
				<!-- svelte-ignore event_directive_deprecated -->
				<ion-input
					name="confirmPassword"
					type="password"
					value={confirmPassword}
					on:ionInput={(event) => updateConfirmPassword(event.detail.value || '')}
					label={$t('routes.auth.register.form.input.confirm-password')}
				>
				</ion-input>
			</ion-item>
			<Button classProp="mt-3" expand="block" type="submit">
				{$t('routes.auth.register.form.submit')}
			</Button>
		</form>
		<Card>
			<div class="text-center" use:clickableElement={() => goto(PageRoute.AUTH.LOGIN)}>
				{$t('routes.auth.register.login.text')}
				<span class="text-[--ion-color-secondary]">{$t('routes.auth.register.login.link')}</span>
			</div>
		</Card>
	</Card>
</IonLayout>
