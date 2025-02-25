<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { emailSchema, type EmailDto } from '$lib/api/dto/client/email.dto';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { type ValidationResult, type FormActions, type FormConfig, Form } from '$lib/models/ui';
	import { customForm } from '$lib/utils';

	const model = emailSchema().cast({}) as EmailDto;
	let validationResult: ValidationResult;
	let actions: FormActions<EmailDto>;

	const config: FormConfig<EmailDto> = {
		schema: emailSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: EmailDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			const validationResult = getValidationResult(
				await apiResources.publicUser.resendConfirmation(model)
			);
			await loading.dismiss();
			if (validationResult.valid) {
				await goto(PageRoute.AUTH.LOGIN);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.resend-confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.resend-confirmation.card.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="email" type="email" label={$t('routes.auth.reset-password.form.email')}
				></ion-input>
			</ion-item>
			<Button classProp="mt-3" expand="block" type="submit">
				{$t('routes.auth.resend-confirmation.form.buttons.send')}
			</Button>
		</form>
	</Card>
</Layout>
