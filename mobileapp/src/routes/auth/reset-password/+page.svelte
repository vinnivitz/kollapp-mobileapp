<script lang="ts">
	import { mailOutline, refreshOutline } from 'ionicons/icons';

	import { publicUserService } from '$lib/api/services';
	import { forgotPasswordSchema } from '$lib/api/validation/authentication';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm } from '$lib/utility';

	const form = new Form({
		request: async (model) => publicUserService.forgotPassword(model),
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
