<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { mailOutline } from 'ionicons/icons';

	import { emailSchema, type EmailDto } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { type ValidationResult, type FormActions, type FormConfig, Form } from '$lib/models/ui';
	import { customForm, getValidationResult } from '$lib/utils';

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
			const validationResult = getValidationResult(await publicUserResource.forgotPassword(model));
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.reset-password.title')} showBackButton hideMenu>
	<Card title={$t('routes.auth.reset-password.card.title')}>
		<form use:customForm={form}>
			<InputItem name="email" label={$t('routes.auth.reset-password.form.email')} icon={mailOutline} />
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.form.buttons.send')}
			/>
		</form>
	</Card>
</Layout>
