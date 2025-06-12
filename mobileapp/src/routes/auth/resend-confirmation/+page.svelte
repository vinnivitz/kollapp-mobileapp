<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { mailOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type ResetPasswordConfirmationDto, resetPasswordConfirmationSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm, getValidationResult } from '$lib/utility';

	const model = resetPasswordConfirmationSchema().cast({}) as ResetPasswordConfirmationDto;
	let actions: FormActions<ResetPasswordConfirmationDto>;

	const config: FormConfig<ResetPasswordConfirmationDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		schema: resetPasswordConfirmationSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: ResetPasswordConfirmationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			result = getValidationResult(await publicUserResource.resendConfirmation(model));
			await loading.dismiss();
			if (result.valid) {
				await goto(PageRoute.AUTH.LOGIN);
			} else {
				actions.applyValidationFeedback(result);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.resend-confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.resend-confirmation.card.title')}>
		<form use:customForm={form}>
			<InputItem name="email" label={$t('routes.auth.reset-password.form.email')} icon={mailOutline} />
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.resend-confirmation.form.buttons.send')}
			/>
		</form>
	</Card>
</Layout>
