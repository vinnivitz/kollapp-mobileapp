<script lang="ts">
	import type { AuthenticationModel } from '$lib/models/models';

	import { loadingController } from 'ionic-svelte';
	import { fingerPrintOutline, keyOutline, logInOutline, personOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	import { type LoginDto, loginSchema } from '$lib/api/dto/client/auth';
	import { authResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { ValidationCode } from '$lib/models/api';
	import { PreferencesKey } from '$lib/models/preferences';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { authenticationStore } from '$lib/stores';
	import {
		customForm,
		getStoredValue,
		getValidationResult,
		isBiometricAvailable,
		isBiometricEnabled,
		requestBiometricAuthentication,
		showAlert
	} from '$lib/utility';

	const model = loginSchema().cast({}) as LoginDto;
	let actions: FormActions<LoginDto>;
	let emailNotConfirmed = $state(false);

	const config: FormConfig<LoginDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		schema: loginSchema()
	};

	const form = new Form(model, config);

	onMount(() => performBiometricVerification());

	async function performBiometricVerification(): Promise<void> {
		if (dev || !(await isBiometricAvailable()) || !(await isBiometricEnabled()) || $authenticationStore) return;

		const credentials = await requestBiometricAuthentication();
		if (credentials) {
			const model: LoginDto = {
				password: credentials.password,
				username: credentials.username
			};
			const result: ValidationResult = { valid: true };
			await onSubmit(model, result);
		}
	}

	async function onSubmit(model: LoginDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			const body = await authResource.login(model);
			result = getValidationResult(body);
			if (result.valid) {
				const authenticationModel: AuthenticationModel = {
					accessToken: body.data.accessToken,
					refreshToken: body.data.refreshToken
				};
				await handleLogin(authenticationModel);
			} else {
				if (result.errors?.[0]?.code === ValidationCode.EMAIL_NOT_CONFIRMED) {
					emailNotConfirmed = true;
					showAlert($t('routes.auth.login.alert.email-not-confirmed'));
				}
				actions.applyValidationFeedback(result);
			}
			await loading.dismiss();
		}
	}

	async function handleLogin(model: AuthenticationModel): Promise<void> {
		await authenticationStore.set(model);
		return goto(PageRoute.HOME);
	}
</script>

<Layout title={$t('routes.auth.login.title')} hideLayout>
	<div class="mb-6">
		<Welcome />
	</div>
	<Card>
		{@render loginForm()}
	</Card>
</Layout>

{#snippet loginForm()}
	<form use:customForm={form}>
		<InputItem name="username" label={$t('routes.auth.login.form.input.username')} icon={personOutline} />
		<InputItem name="password" type="password" label={$t('routes.auth.login.form.input.password')} icon={keyOutline} />
		<Button
			classProp="mt-3"
			expand="block"
			type="submit"
			label={$t('routes.auth.login.form.submit')}
			icon={logInOutline}
		/>
	</form>
	{#if emailNotConfirmed}
		<Card click={() => goto(PageRoute.AUTH.RESEND_CONFIRMATION)} classProp="text-center">
			{$t('routes.auth.login.resend-confirmation.text')}
			<ion-text color="secondary">{$t('routes.auth.login.resend-confirmation.link')}</ion-text>
		</Card>
	{/if}
	{#await getStoredValue(PreferencesKey.BIOMETRICS_ENABLED) then enabled}
		{#if enabled}
			<Button
				fill="outline"
				expand="block"
				icon={fingerPrintOutline}
				label={$t('routes.auth.login.biometrics')}
				click={performBiometricVerification}
			/>
		{/if}
	{/await}
	<Card color="light" click={() => goto(PageRoute.AUTH.REGISTER)} classProp="text-center">
		{$t('routes.auth.login.register.text')}
		<ion-text color="secondary">{$t('routes.auth.login.register.link')}</ion-text>
	</Card>
	<Card color="light" click={() => goto(PageRoute.AUTH.RESET_PASSWORD)} classProp="text-center">
		{$t('routes.auth.login.forgot-password.text')}
		<ion-text color="secondary">{$t('routes.auth.login.forgot-password.link')}</ion-text>
	</Card>
{/snippet}
