<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp, mailOpenOutline, mailOutline, personCircleOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type RegisterDto, registerSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm, getValidationResult } from '$lib/utility';

	const model = registerSchema().cast({}) as RegisterDto;
	let actions: FormActions<RegisterDto>;

	const config: FormConfig<RegisterDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		schema: registerSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterDto, validationResult: ValidationResult): Promise<void> {
		if (validationResult.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			delete model.confirmPassword;
			validationResult = getValidationResult(await publicUserResource.register(model));
			await loader.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
				goto(PageRoute.AUTH.LOGIN);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
		}
	}
</script>

<Layout title={$t('routes.auth.register.title')} hideLayout>
	<div class="mb-6">
		<Welcome />
	</div>
	<Card title={$t('routes.auth.register.card.join-organization.title')}>
		<div class="flex items-center gap-4">
			<ion-icon icon={mailOpenOutline} size="large" class="flex-none"></ion-icon>
			<ion-text class="flex-auto">
				{$t('routes.auth.register.card.join-organization.content')}
			</ion-text>
		</div>
	</Card>
	<Card title={$t('routes.auth.register.card.register-organization.title')}>
		{@render registerForm()}
	</Card>
</Layout>

{#snippet registerForm()}
	<form use:customForm={form}>
		<InputItem name="username" label={$t('routes.auth.register.form.input.username')} icon={personCircleOutline} />
		<InputItem name="email" type="email" label={$t('routes.auth.register.form.input.email')} icon={mailOutline} />
		<InputItem
			name="password"
			type="password"
			label={$t('routes.auth.register.form.input.password')}
			icon={keyOutline}
		/>
		<InputItem
			name="confirmPassword"
			type="password"
			label={$t('routes.auth.register.form.input.confirm-password')}
			icon={keySharp}
		/>
		<Button
			classProp="mt-3"
			expand="block"
			type="submit"
			label={$t('routes.auth.register.form.submit')}
			icon={saveOutline}
		/>
	</form>
	<Card click={() => goto(PageRoute.AUTH.LOGIN)} classProp="text-center">
		{$t('routes.auth.register.login.text')}
		<ion-text color="secondary">{$t('routes.auth.register.login.link')}</ion-text>
	</Card>
{/snippet}
