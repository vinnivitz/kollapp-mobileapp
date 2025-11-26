<script lang="ts">
	import type { PasswordChangeRequestTO } from '@kollapp/api-types';

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
		updatePasswordBiometricCredentials
	} from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) => {
			if ((await isBiometricAvailable()) && (await isBiometricEnabled())) {
				await updatePasswordBiometricCredentials(model.newPassword);
			}
			goto(resolve('/account'));
		},
		request: async (model: PasswordChangeRequestTO) => userService.changePassword(model),
		schema: changePasswordSchema()
	});
</script>

<Layout title={$t('routes.auth.change-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.change-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="currentPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.current-password')}
				icon={keyOutline}
			/>
			<TextInputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.change-password.form.input.new-password')}
				icon={keySharp}
			/>
			<TextInputItem
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
