<script lang="ts">
	import { mailOutline, refreshOutline } from 'ionicons/icons';

	import { forgotPasswordSchema } from '$lib/api/schemas/authentication';
	import { publicUserService } from '$lib/api/services';
	import { Layout } from '$lib/components/layout';
	import { Button, Card, InputItem } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, informationModal } from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) =>
			await informationModal(
				$t('routes.auth.reset-password.page.modal.message'),
				$t('routes.auth.reset-password.page.modal.title', { value: model.email })
			),
		request: publicUserService.forgotPassword,
		schema: forgotPasswordSchema()
	});
</script>

<Layout title={$t('routes.auth.reset-password.page.title')} showBackButton hideMenu>
	<Card title={$t('routes.auth.reset-password.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="email"
				inputmode="email"
				label={$t('routes.auth.reset-password.page.card.form.email')}
				icon={mailOutline}
			/>
			<Button
				icon={refreshOutline}
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.page.card.form.submit')}
			/>
		</form>
	</Card>
</Layout>
