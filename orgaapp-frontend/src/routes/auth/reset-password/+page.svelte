<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import * as api from '$lib/api';
	import { emailSchema, type EmailDto } from '$lib/api/dto/email.dto';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { type ValidationResult, type FormActions, type FormConfig, Form } from '$lib/models';
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
			const validationResult = await api.auth.requestPasswordReset(model);
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.reset-password.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.card.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="email" type="email" label={$t('routes.auth.reset-password.form.email')}
				></ion-input>
			</ion-item>
			<ion-button class="mt-3" expand="block" type="submit">
				{$t('routes.auth.reset-password.form.buttons.send')}
			</ion-button>
		</form>
	</Card>
</Layout>
