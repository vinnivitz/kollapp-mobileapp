<script lang="ts">
	import { mailOutline, personOutline, saveOutline } from 'ionicons/icons';

	import { type UpdateUserDataDto, updateUserDataSchema } from '$lib/api/dto/client/user';
	import { userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import {
		customForm,
		isBiometricAvailable,
		isBiometricEnabled,
		updateUsernameBiometricCredentials
	} from '$lib/utility';

	let touched = $state(false);

	let actions: FormActions<UpdateUserDataDto>;

	const form = $derived(
		new Form({
			completed: async ({ model }) => {
				if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
					await updateUsernameBiometricCredentials(model.username);
				}
				await userStore.init();
			},
			exposedActions: (exposedActions) => (actions = exposedActions),
			onTouched: () => (touched = true),
			request: async (model: UpdateUserDataDto) => userResource.update(model),
			schema: updateUserDataSchema()
		})
	);

	$effect(() => {
		if ($userStore) {
			actions.setModel({
				email: $userStore.email,
				username: $userStore.username
			});
		}
	});
</script>

<Layout title={$t('routes.account.update-data.title')} showBackButton>
	<Card title={$t('routes.account.update-data.card.title')}>
		<form use:customForm={form}>
			<InputItem name="username" label={$t('routes.account.update-data.card.form.username')} icon={personOutline} />
			<InputItem
				name="email"
				label={$t('routes.account.update-data.card.form.email')}
				icon={mailOutline}
				type="email"
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				disabled={!touched}
				label={$t('routes.account.update-data.card.form.button.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
