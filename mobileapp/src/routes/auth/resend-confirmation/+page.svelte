<script lang="ts">
	import type { ResponseBody } from '$lib/models/api';

	import { mailOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { resendConfirmationSchema } from '$lib/api/validation/authentication';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, featureNotImplementedAlert } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(resolve('/auth/login')),
		request: async () => featureNotImplementedAlert() as unknown as Promise<ResponseBody<void>>,
		schema: resendConfirmationSchema()
	});
</script>

<Layout title={$t('routes.auth.resend-confirmation.page.title')} showBackButton>
	<Card title={$t('routes.auth.resend-confirmation.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="email"
				inputmode="email"
				label={$t('routes.auth.resend-confirmation.page.card.form.email')}
				icon={mailOutline}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.resend-confirmation.page.card.form.submit')}
			/>
		</form>
	</Card>
</Layout>
