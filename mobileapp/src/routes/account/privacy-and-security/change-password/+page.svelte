<script lang="ts">
	import { keyOutline, keySharp, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { changePasswordSchema } from '$lib/api/schemas/user';
	import { userService } from '$lib/api/services';
	import { Button, Card, InputItem } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, passwordConfirmationValidator } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(resolve('/account')),
		request: async (model) => userService.changePassword(model),
		schema: changePasswordSchema(),
		validators: {
			confirmNewPassword: passwordConfirmationValidator('newPassword', 'confirmNewPassword')
		}
	});
</script>

<Layout title={$t('routes.account.privacy-and-security.change-password.page.title')} showBackButton>
	<Card title={$t('routes.account.privacy-and-security.change-password.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="currentPassword"
				type="password"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.current-password')}
				icon={keyOutline}
			/>
			<InputItem
				name="newPassword"
				type="password"
				label={$t('routes.account.privacy-and-security.change-password.page.card.form.new-password')}
				icon={keySharp}
			/>
			<InputItem
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
