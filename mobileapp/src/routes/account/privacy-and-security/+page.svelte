<script lang="ts">
	import type { LoginRequestTO } from '@kollapp/api-types';

	import { fingerPrintOutline, keyOutline, notificationsOutline, receiptOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { authenticationService } from '$lib/api/services';
	import { loginSchema } from '$lib/api/validation/authentication';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { Form, type FormActions } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import {
		customForm,
		deleteBiometricCredentials,
		featureNotImplementedAlert,
		getStoredValue,
		isBiometricAvailable,
		storeBiometricCredentials
	} from '$lib/utility';

	let showPasswordPrompt = $state<boolean>(false);
	let isPasswordConfirmed = $state<boolean>(false);
	let toggle = $state<HTMLIonToggleElement>();

	let actions: FormActions<LoginRequestTO>;

	const form = new Form({
		completed: async ({ model }) => onPasswordConfirmed($userStore?.username!, model.password),
		exposedActions: (exposedActions) => (actions = exposedActions),
		hiddenFields: { username: $userStore?.username! },
		request: async (model: LoginRequestTO) => authenticationService.login(model),
		schema: loginSchema()
	});

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

	async function onPasswordConfirmed(username: string, password: string): Promise<void> {
		isPasswordConfirmed = true;
		await storeBiometricCredentials(username, password);
		onPasswordPromptDismiss();
		setToggleValue(true);
	}

	async function onPasswordPromptDismiss(): Promise<void> {
		actions.setModel();
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

<Layout title={$t('routes.account.privacy-and-security.page.title')} showBackButton>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.privacy-and-security.page.list.privacy.header')}</ion-list-header>
		<LabeledItem
			clicked={() => featureNotImplementedAlert()}
			icon={notificationsOutline}
			label={$t('routes.account.privacy-and-security.page.list.privacy.notifications')}
		/>
		<LabeledItem
			label={$t('routes.account.privacy-and-security.page.list.privacy.legal')}
			icon={receiptOutline}
			indexed="/account/privacy-and-security/legal"
			clicked={() => goto(resolve('/account/privacy-and-security/legal'))}
		/>
	</ion-list>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.privacy-and-security.page.list.security.header')}</ion-list-header>
		<LabeledItem
			indexed="/account/privacy-and-security/change-password"
			clicked={() => goto(resolve('/account/privacy-and-security/change-password'))}
			icon={keyOutline}
			label={$t('routes.account.privacy-and-security.page.list.security.change-password')}
		/>
		{#await isBiometricAvailable() then isAvailable}
			<CustomItem
				icon={fingerPrintOutline}
				indexLabel={$t('routes.account.privacy-and-security.page.list.security.login-with-biometrics')}
				indexed="/account/privacy-and-security"
			>
				<ion-toggle
					bind:this={toggle}
					color="secondary"
					enable-on-off-labels
					class="ms-4"
					disabled={!isAvailable}
					onionChange={() => onToggleBiometrics()}
				>
					{$t('routes.account.privacy-and-security.page.list.security.login-with-biometrics')}
				</ion-toggle>
			</CustomItem>
		{/await}
	</ion-list>
</Layout>

<Popover extended open={showPasswordPrompt} dismissed={onPasswordPromptDismiss}>
	<Card title={$t('routes.account.privacy-and-security.page.modal.password.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.account.privacy-and-security.page.modal.password.card.form.password')}
				icon={keyOutline}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.privacy-and-security.page.modal.password.card.form.submit')}
				icon={keyOutline}
			/>
		</form>
	</Card>
</Popover>
