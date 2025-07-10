<script lang="ts">
	import { mailOutline, refreshOutline } from 'ionicons/icons';

	import { resetPasswordSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm } from '$lib/utility';

	const form = new Form({
		request: async (model) => publicUserResource.forgotPassword(model),
		schema: resetPasswordSchema()
	});
</script>

<Layout title={$t('routes.auth.reset-password.title')} showBackButton hideMenu>
	<Card title={$t('routes.auth.reset-password.card.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="email"
				inputmode="email"
				label={$t('routes.auth.reset-password.form.email')}
				icon={mailOutline}
			/>
			<Button
				icon={refreshOutline}
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.form.buttons.send')}
			/>
		</form>
	</Card>
</Layout>
