<script lang="ts">
	import { loadingController } from '@ionic/core';
	import { fingerPrintOutline, keyOutline, logInOutline, personOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { loginSchema } from '$lib/api/schema/authentication';
	import { authenticationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { StorageKey } from '$lib/models/storage';
	import { Form } from '$lib/models/ui';
	import { authenticationStore, organizationStore } from '$lib/stores';
	import {
		customForm,
		getStoredValue,
		informationModal,
		isBiometricAvailable,
		isBiometricEnabled,
		promptBiometricAuthentication,
		showAlert,
		StatusCheck,
		storeValue
	} from '$lib/utility';

	const form = new Form({
		completed: onComplete,
		request: authenticationService.login,
		schema: loginSchema()
	});

	onMount(async () => performBiometricVerification());

	async function performBiometricVerification(): Promise<void> {
		if (dev || !(await isBiometricAvailable()) || !(await isBiometricEnabled()) || $authenticationStore) return;

		const credentials = await promptBiometricAuthentication();
		if (!credentials) return;

		const loading = await loadingController.create({});
		await loading.present();

		const response = await authenticationService.login(credentials);
		if (StatusCheck.isOK(response.status)) {
			onComplete();
		} else {
			await Promise.all([
				showAlert($t('routes.auth.login.page.biometrics.wrong-credentials')),
				storeValue(StorageKey.BIOMETRICS_ENABLED, false)
			]);
		}
		await loading.dismiss();
	}

	async function onComplete(): Promise<void> {
		await goto(resolve('/'));
		const welcomeShown = await getStoredValue(StorageKey.WELCOME_SHOWN);
		if (!welcomeShown && !get(organizationStore)) {
			await storeValue(StorageKey.WELCOME_SHOWN, true);
			await informationModal(
				$t('routes.auth.login.page.welcome-modal.title'),
				$t('routes.auth.login.page.welcome-modal.message')
			);
		}
	}
</script>

<Layout>
	<div class="mb-6">
		<Welcome />
	</div>
	<Card lazy>
		{@render loginForm()}
	</Card>
</Layout>

{#snippet loginForm()}
	<form use:customForm={form}>
		<InputItem name="username" label={$t('routes.auth.login.page.form.username')} icon={personOutline} />
		<InputItem name="password" type="password" label={$t('routes.auth.login.page.form.password')} icon={keyOutline} />
		<Button
			classList="mt-3"
			expand="block"
			type="submit"
			label={$t('routes.auth.login.page.form.submit')}
			icon={logInOutline}
		/>
	</form>
	{#await getStoredValue(StorageKey.BIOMETRICS_ENABLED) then enabled}
		{#if enabled}
			<Button
				fill="outline"
				expand="block"
				icon={fingerPrintOutline}
				label={$t('routes.auth.login.page.login-with-biometrics')}
				clicked={performBiometricVerification}
			/>
		{/if}
	{/await}
	<Card color="light" clicked={() => goto(resolve('/auth/register'))} classList="text-center flex flex-wrap gap-1" lazy>
		<ion-text>{$t('routes.auth.login.page.register.question')}</ion-text>
		<ion-text color="secondary">{$t('routes.auth.login.page.register.link')}</ion-text>
	</Card>
	<Card
		color="light"
		clicked={() => goto(resolve('/auth/reset-password'))}
		classList="text-center flex flex-wrap gap-1"
		lazy
	>
		<ion-text>{$t('routes.auth.login.page.forgot-password.question')}</ion-text>
		<ion-text color="secondary">{$t('routes.auth.login.page.forgot-password.link')}</ion-text>
	</Card>
{/snippet}
