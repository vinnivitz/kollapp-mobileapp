<script lang="ts">
	import { keyOutline, keySharp, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { userService } from '$lib/api/services';
	import { changePasswordSchema } from '$lib/api/validation/user';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import {
		customForm,
		isBiometricAvailable,
		isBiometricEnabled,
		passwordConfirmationValidator,
		updatePasswordBiometricCredentials
	} from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) => {
			if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
				await updatePasswordBiometricCredentials(model.newPassword);
			}
			goto(resolve('/account'));
		},
		customValidators: [passwordConfirmationValidator('newPassword', 'confirmNewPassword')],
		request: async (model) => userService.changePassword(model),
		schema: changePasswordSchema()
	});
</script>

<Layout title={$t('routes.account.privacy-and-security.change-password.page.title')} showBackButton>
	<Card title={$t('routes.account.privacy-and-security.change-password.page.card.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="currentPassword"
				type="password"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.current-password')}
				icon={keyOutline}
			/>
			<TextInputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.new-password')}
				icon={keySharp}
			/>
			<TextInputItem
				name="confirmNewPassword"
				type="password"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.confirm-new-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
