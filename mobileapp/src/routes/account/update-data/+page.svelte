<script lang="ts">
	import type { KollappUserUpdateRequestTO } from '@kollapp/api-types';

	import { mailOutline, personOutline, saveOutline } from 'ionicons/icons';

	import { userService } from '$lib/api/services';
	import { updateUserDataSchema } from '$lib/api/validation/user';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import {
		customForm,
		isBiometricAvailable,
		isBiometricEnabled,
		updateUsernameBiometricCredentials
	} from '$lib/utility';

	let touched = $state<boolean>(false);

	const form = new Form({
		completed: async ({ model }) => {
			if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
				await updateUsernameBiometricCredentials(model.username);
			}
			await userStore.init();
		},
		exposedActions: (actions) => {
			actions.setModel({
				email: $userStore!.email,
				username: $userStore!.username
			});
		},
		onTouched: () => (touched = true),
		request: async (model: KollappUserUpdateRequestTO) => userService.update(model),
		schema: updateUserDataSchema()
	});
</script>

<Layout title={$t('routes.account.update-data.page.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.account.update-data.page.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="username"
					label={$t('routes.account.update-data.page.card.form.username')}
					icon={personOutline}
				/>
				<InputItem
					name="email"
					inputmode="email"
					label={$t('routes.account.update-data.page.card.form.email')}
					icon={mailOutline}
					type="email"
				/>
				<Button
					classList="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.account.update-data.page.card.form.submit')}
					icon={saveOutline}
				/>
			</form>
		</Card>
	{/if}
</Layout>
