<script lang="ts">
	import type { ResponseBody } from '$lib/models/api';

	import { mailOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { resendConfirmationSchema } from '$lib/api/validation/authentication';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import { customForm, featureNotImplementedAlert } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(PageRoute.AUTH.LOGIN),
		request: async () => featureNotImplementedAlert() as unknown as Promise<ResponseBody<void>>,
		schema: resendConfirmationSchema()
	});
</script>

<Layout title={$t('routes.auth.resend-confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.resend-confirmation.card.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="email"
				inputmode="email"
				label={$t('routes.auth.reset-password.form.email')}
				icon={mailOutline}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.resend-confirmation.form.buttons.send')}
			/>
		</form>
	</Card>
</Layout>
