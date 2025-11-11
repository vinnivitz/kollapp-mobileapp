<script lang="ts">
	import type { PageData } from './$types';

	import { keyOutline, keySharp } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { resetPasswordConfirmationSchema } from '$lib/api/dto/client/authentication';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import { customForm, showAlert } from '$lib/utility';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		if (!data.token) {
			showAlert($t('routes.auth.reset-password.confirmation.no-token'));
			goto(PageRoute.AUTH.LOGIN);
		}
	});

	const form = new Form({
		completed: async () => goto(PageRoute.AUTH.LOGIN),
		request: async (model) => {
			delete model.confirmPassword;
			return publicUserResource.resetPassword(model, data.token!);
		},
		schema: resetPasswordConfirmationSchema()
	});
</script>

<Layout title={$t('routes.auth.reset-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="password"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.password')}
				icon={keyOutline}
			/>
			<TextInputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.confirmation.form.submit')}
			/>
		</form>
	</Card>
</Layout>
