<script lang="ts">
	import type { ResponseBody } from '$lib/models/api';

	import { mailOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { resendConfirmationSchema } from '$lib/api/schemas/authentication';
	import { Button, Card, InputItem } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, featureNotImplementedAlert } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(resolve('/auth/login')),
		request: async () => featureNotImplementedAlert() as unknown as Promise<ResponseBody>,
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
