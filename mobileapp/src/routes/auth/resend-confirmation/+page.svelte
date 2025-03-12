<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { mailOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type EmailDto, emailSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm, getValidationResult } from '$lib/utils';

	const model = emailSchema().cast({}) as EmailDto;
	let actions: FormActions<EmailDto>;

	const config: FormConfig<EmailDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		schema: emailSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: EmailDto, result: ValidationResult): Promise<void> {
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
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.resend-confirmation.form.buttons.send')}
			/>
		</form>
	</Card>
</Layout>
