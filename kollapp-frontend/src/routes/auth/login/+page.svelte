<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { loginSchema, type LoginDto } from '$lib/api/dto/client';
	import { ValidationCode } from '$lib/api/models';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { AuthenticationModel, UserModel } from '$lib/models/store';
	import {
		AlertType,
		Form,
		type FormActions,
		type FormConfig,
		type ValidationResult
	} from '$lib/models/ui';
	import { authenticationStore, userStore } from '$lib/store';
	import { clickableElement, customForm, showAlert } from '$lib/utils';

	const model = loginSchema().cast({}) as LoginDto;
	let validationResult: ValidationResult;
	let actions: FormActions<LoginDto>;
	let emailNotConfirmed = $state(false);

	const config: FormConfig<LoginDto> = {
		schema: loginSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: LoginDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			const body = await apiResources.auth.login(model);
			validationResult = getValidationResult(body);
			if (validationResult.valid) {
				const authenticationModel: AuthenticationModel = {
					accessToken: body.data.accessToken,
					refreshToken: body.data.refreshToken
				};
				authenticationStore.set(authenticationModel);
				const userModel: UserModel = {
					name: body.data.name,
					username: body.data.username,
					email: body.data.email
				};
				userStore.set(userModel);
				await goto(PageRoute.HOME);
			} else {
				if (validationResult.errors?.[0].code === ValidationCode.EMAIL_NOT_CONFIRMED) {
					emailNotConfirmed = true;
					showAlert({
						type: AlertType.ERROR,
						message: $t('routes.auth.login.alert.email-not-confirmed')
					});
				}
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.auth.login.title')} showBackButton>
	<Card title={$t('routes.auth.login.form.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="username" label={$t('routes.auth.login.form.input.username')}></ion-input>
			</ion-item>
			<ion-item>
				<ion-input
					name="password"
					type="password"
					label={$t('routes.auth.login.form.input.password')}
				></ion-input>
			</ion-item>
			<ion-button class="mt-3" expand="block" type="submit">
				{$t('routes.auth.login.form.submit')}
			</ion-button>
		</form>
		{#if emailNotConfirmed}
			<Card>
				<div
					class="text-center"
					use:clickableElement={() => goto(PageRoute.AUTH.RESEND_CONFIRMATION)}
				>
					{$t('routes.auth.login.resend-confirmation.text')}
					<ion-text color="primary">{$t('routes.auth.login.resend-confirmation.link')}</ion-text>
				</div>
			</Card>
		{/if}
		<Card>
			<div class="text-center" use:clickableElement={() => goto(PageRoute.AUTH.REGISTER)}>
				{$t('routes.auth.login.register.text')}
				<ion-text color="primary">{$t('routes.auth.login.register.link')}</ion-text>
			</div>
		</Card>
		<Card>
			<div class="text-center" use:clickableElement={() => goto(PageRoute.AUTH.RESET_PASSWORD)}>
				{$t('routes.auth.login.forgot-password.text')}
				<ion-text color="primary">{$t('routes.auth.login.forgot-password.link')}</ion-text>
			</div>
		</Card>
	</Card>
</Layout>
