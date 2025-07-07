<script lang="ts">
	import { keyOutline, keySharp, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type ChangePasswordDto, changePasswordSchema } from '$lib/api/dto/client/user';
	import { userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import {
		customForm,
		isBiometricAvailable,
		isBiometricEnabled,
		updatePasswordBiometricCredentials
	} from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) => {
			if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
				await updatePasswordBiometricCredentials(model.newPassword);
			}
			goto(PageRoute.ACCOUNT.ROOT);
		},
		failed: (result) => {
			for (const error of result.errors ?? []) {
				if (error.field === ('password' as keyof ChangePasswordDto)) {
					error.field = 'currentPassword';
				}
			}
		},
		request: async (model: ChangePasswordDto) => userResource.changePassword(model),
		schema: changePasswordSchema()
	});
</script>

<Layout title={$t('routes.auth.change-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.change-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="currentPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.current-password')}
				icon={keyOutline}
			/>
			<InputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.new-password')}
				icon={keySharp}
			/>
			<InputItem
				name="confirmNewPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.change-password.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
