<script lang="ts">
	import type { PageData } from './$types';
	import type { ResetPasswordRequestTO } from '@kollapp/api-types';

	import { keyOutline, keySharp } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { resetPasswordSchema } from '$lib/api/schema/authentication';
	import { publicUserService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, passwordConfirmationValidator, showAlert } from '$lib/utility';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		if (!data.token) {
			showAlert($t('routes.auth.reset-password.confirmation.page.no-token'));
			goto(resolve('/auth/login'));
		}
	});

	const form = new Form({
		completed: async () => goto(resolve('/auth/login')),
		customValidators: {
			confirmPassword: passwordConfirmationValidator<ResetPasswordRequestTO & { confirmPassword: string }>(
				'password',
				'confirmPassword'
			)
		},
		request: async (model) => {
			return publicUserService.resetPassword(model, data.token!);
		},
		schema: resetPasswordSchema()
	});
</script>

<Layout title={$t('routes.auth.reset-password.confirmation.page.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.confirmation.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.page.card.form.password')}
				icon={keyOutline}
			/>
			<InputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.page.card.form.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.confirmation.page.card.form.submit')}
			/>
		</form>
	</Card>
</Layout>
