<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, personOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { loginSchema, type LoginDto } from '$lib/api/dto/client';
	import { ValidationCode } from '$lib/api/models';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import environment from '$lib/environment';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { PageRoute } from '$lib/models/routing';
	import type { AuthenticationModel } from '$lib/models/store';
	import {
		AlertType,
		Form,
		type FormActions,
		type FormConfig,
		type ValidationResult
	} from '$lib/models/ui';
	import { authenticationStore } from '$lib/store';
	import { customForm, showAlert, storeValue } from '$lib/utils';

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
				await storeValue(PreferencesKey.LOCAL_USER, false);
				const authenticationModel: AuthenticationModel = {
					accessToken: body.data.accessToken,
					refreshToken: body.data.refreshToken
				};
				await handleLogin(authenticationModel);
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

	async function localSignin(): Promise<void> {
		await storeValue(PreferencesKey.LOCAL_USER, true);
		const model: AuthenticationModel = { accessToken: 'local', refreshToken: 'local' };
		await handleLogin(model);
	}

	async function handleLogin(model: AuthenticationModel): Promise<void> {
		await authenticationStore.set(model);
		await goto(PageRoute.HOME);
	}
</script>

<Layout title={$t('routes.auth.login.title')} hideLayout>
	<div class="mb-6">
		<Welcome></Welcome>
	</div>
	<Card>
		<form use:customForm={form}>
			<InputItem
				name="username"
				label={$t('routes.auth.login.form.input.username')}
				iconSrc={personOutline}
			/>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.login.form.input.password')}
				iconSrc={keyOutline}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.login.form.submit')}
			/>
		</form>
		{#if emailNotConfirmed}
			<Card click={() => goto(PageRoute.AUTH.RESEND_CONFIRMATION)} classProp="text-center">
				{$t('routes.auth.login.resend-confirmation.text')}
				<ion-text color="tertiary">{$t('routes.auth.login.resend-confirmation.link')}</ion-text>
			</Card>
		{/if}
		<Card click={() => goto(PageRoute.AUTH.REGISTER)} classProp="text-center">
			{$t('routes.auth.login.register.text')}
			<ion-text color="tertiary">{$t('routes.auth.login.register.link')}</ion-text>
		</Card>
		<Card click={() => goto(PageRoute.AUTH.RESET_PASSWORD)} classProp="text-center">
			{$t('routes.auth.login.forgot-password.text')}
			<ion-text color="tertiary">{$t('routes.auth.login.forgot-password.link')}</ion-text>
		</Card>
	</Card>
	{#if environment.localUser}
		<Card title={$t('routes.auth.login.card.dev.title')}>
			<div class="text-center">
				<Button click={localSignin} label={$t('routes.auth.login.card.dev.button')} />
			</div>
		</Card>
	{/if}
</Layout>
