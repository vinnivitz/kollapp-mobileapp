<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import {
		constructOutline,
		fingerPrintOutline,
		keyOutline,
		notificationsOutline,
		receiptOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	import { type LoginDto, type VerifyPasswordDto, verifyPasswordSchema } from '$lib/api/dto/client/auth';
	import { authResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import {
		customForm,
		deleteBiometricCredentials,
		featureNotImplementedAlert,
		getStoredValue,
		getValidationResult,
		isBiometricAvailable,
		storeBiometricCredentials
	} from '$lib/utility';

	let showPasswordPrompt = $state(false);
	let toggle = $state<HTMLIonToggleElement | undefined>();
	let isPasswordConfirmed = $state(false);

	const model = verifyPasswordSchema().cast({}) as VerifyPasswordDto;
	let actions: FormActions<VerifyPasswordDto>;
	const config: FormConfig<VerifyPasswordDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		schema: verifyPasswordSchema()
	};
	const form = new Form(model, config);

	onMount(async () => {
		if (dev) return;
		setToggleValue(await isBiometricsEnabled());
	});

	async function onToggleBiometrics(): Promise<void> {
		if (await isBiometricsEnabled()) {
			await deleteBiometricCredentials();
			setToggleValue(false);
		} else {
			showPasswordPrompt = true;
			isPasswordConfirmed = false;
		}
	}

	async function onSubmit(model: VerifyPasswordDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			const username = $userStore?.username;

			if (!username) return;

			const loginModel: LoginDto = { password: model.password, username };
			const body = await authResource.login(loginModel);
			result = getValidationResult(body);
			if (result.valid) {
				onPasswordConfirmed(username, model.password);
			} else {
				actions.applyValidationFeedback(result);
			}
			await loading.dismiss();
		}
	}

	async function onPasswordConfirmed(username: string, password: string): Promise<void> {
		isPasswordConfirmed = true;
		await storeBiometricCredentials(username, password);
		onPasswordPromptDismiss();
		setToggleValue(true);
	}

	async function onPasswordPromptDismiss(): Promise<void> {
		actions.resetModel();
		showPasswordPrompt = false;
		if (!isPasswordConfirmed) {
			setToggleValue(false);
		}
	}

	function setToggleValue(value: boolean): void {
		if (toggle) {
			toggle.checked = value;
		}
	}

	async function isBiometricsEnabled(): Promise<boolean> {
		return (await getStoredValue<boolean>(PreferencesKey.BIOMETRICS_ENABLED)) ?? false;
	}
</script>

<Layout title={$t('routes.account.page.privacy-and-security.title')} showBackButton>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.page.privacy-and-security.list.privacy')}</ion-list-header>
		<LabeledItem
			click={() => featureNotImplementedAlert()}
			icon={notificationsOutline}
			label={$t('routes.account.list.account.privacy-and-security.button.notifications')}
		/>
		<LabeledItem
			label={$t('routes.account.page.privacy-and-security.security.list.legal')}
			icon={receiptOutline}
			searchable={PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.LEGAL}
			click={() => goto(PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.LEGAL)}
		></LabeledItem>
		<LabeledItem
			label="App version"
			icon={constructOutline}
			click={() => goto(PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.APP_VERSION)}
			searchable={PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.APP_VERSION}
		></LabeledItem>
	</ion-list>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.page.privacy-and-security.list.security')}</ion-list-header>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.CHANGE_PASSWORD}
			click={() => goto(PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.CHANGE_PASSWORD)}
			icon={keyOutline}
			label={$t('routes.account.list.account.privacy-and-security.button.change-password')}
		/>
		{#await isBiometricAvailable() then isAvailable}
			<CustomItem
				icon={fingerPrintOutline}
				id={$t('routes.account.list.account.privacy-and-security.button.biometrics')}
				searchable={PageRoute.ACCOUNT.PRIVACY_AND_SECURITY.ROOT}
			>
				<!-- svelte-ignore event_directive_deprecated -->
				<ion-toggle
					bind:this={toggle}
					color="secondary"
					enable-on-off-labels
					class="ms-4"
					disabled={!isAvailable}
					on:ionChange={() => onToggleBiometrics()}
				>
					{$t('routes.account.list.account.privacy-and-security.button.biometrics')}
				</ion-toggle>
			</CustomItem>
		{/await}
	</ion-list>
</Layout>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover class="extended" is-open={showPasswordPrompt} on:didDismiss={onPasswordPromptDismiss}>
	<Card title="Enter your password">
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.account.list.account.privacy-and-security.form.input.password')}
				icon={keyOutline}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.list.account.privacy-and-security.form.submit')}
				icon={keyOutline}
			/>
		</form>
	</Card>
</ion-popover>

<style>
	ion-popover.extended {
		--width: 95%;
	}
</style>
