<script lang="ts">
	import type { UserAuthenticationDto } from '$lib/api/dto/server';
	import type { AuthenticationModel } from '$lib/models/models';

	import { loadingController } from '@ionic/core';
	import {
		fingerPrintOutline,
		keyOutline,
		logInOutline,
		logoApple,
		logoGithub,
		logoGoogle,
		logoSlack,
		personOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	import { type LoginDto, loginSchema } from '$lib/api/dto/client/authentication';
	import { authenticationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import { authenticationStore } from '$lib/stores';
	import {
		customForm,
		featureNotImplementedAlert,
		getStoredValue,
		getValidationResult,
		isBiometricAvailable,
		isBiometricEnabled,
		requestBiometricAuthentication,
		showAlert,
		storeValue
	} from '$lib/utility';

	const form = new Form({
		completed: async ({ response }) => await handleLogin(response),
		request: async (model: LoginDto) => await authenticationResource.login(model),
		schema: loginSchema()
	});

	onMount(async () => await performBiometricVerification());

	async function performBiometricVerification(): Promise<void> {
		if (dev || !(await isBiometricAvailable()) || !(await isBiometricEnabled()) || $authenticationStore) return;

		const credentials = await requestBiometricAuthentication();
		if (!credentials) return;

		const loading = await loadingController.create({});
		await loading.present();

		const response = await authenticationResource.login({
			password: credentials.password,
			username: credentials.username
		} as LoginDto);
		const result = getValidationResult<LoginDto>(response);
		await (result.valid
			? handleLogin(response.data)
			: Promise.all([
					showAlert('Could not log in with biometrics. Wrong credentials provided.'),
					storeValue(PreferencesKey.BIOMETRICS_ENABLED, false)
				]));
		await loading.dismiss();
	}

	async function handleLogin(model: UserAuthenticationDto): Promise<void> {
		const authenticationModel: AuthenticationModel = {
			accessToken: model.accessToken,
			refreshToken: model.refreshToken
		};
		await authenticationStore.set(authenticationModel);
		goto(PageRoute.HOME);
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
		<TextInputItem name="username" label={$t('routes.auth.login.form.input.username')} icon={personOutline} />
		<TextInputItem
			name="password"
			type="password"
			label={$t('routes.auth.login.form.input.password')}
			icon={keyOutline}
		/>
		<Button
			classList="mt-3"
			expand="block"
			type="submit"
			label={$t('routes.auth.login.form.submit')}
			icon={logInOutline}
		/>
	</form>
	{#await getStoredValue(PreferencesKey.BIOMETRICS_ENABLED) then enabled}
		{#if enabled}
			<Button
				fill="outline"
				expand="block"
				icon={fingerPrintOutline}
				label={$t('routes.auth.login.biometrics')}
				clicked={performBiometricVerification}
			/>
		{/if}
	{/await}
	{#if dev}
		<div class="mx-3 flex justify-between gap-2">
			<Button color="tertiary" size="large" fill="outline" icon={logoGoogle} clicked={featureNotImplementedAlert} />
			<Button color="tertiary" size="large" fill="outline" icon={logoApple} clicked={featureNotImplementedAlert} />
			<Button color="tertiary" size="large" fill="outline" icon={logoSlack} clicked={featureNotImplementedAlert} />
			<Button color="tertiary" size="large" fill="outline" icon={logoGithub} clicked={featureNotImplementedAlert} />
		</div>
	{/if}
	<Card color="light" clicked={() => goto(PageRoute.AUTH.REGISTER)} classList="text-center">
		{$t('routes.auth.login.register.text')}
		<ion-text color="secondary">{$t('routes.auth.login.register.link')}</ion-text>
	</Card>
	<Card color="light" clicked={() => goto(PageRoute.AUTH.RESET_PASSWORD)} classList="text-center">
		{$t('routes.auth.login.forgot-password.text')}
		<ion-text color="secondary">{$t('routes.auth.login.forgot-password.link')}</ion-text>
	</Card>
{/snippet}
