<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import {
		keyOutline,
		keySharp,
		mailOpenOutline,
		mailOutline,
		peopleOutline,
		personCircleOutline,
		personOutline,
		saveOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { registerSchema, type RegisterDto } from '$lib/api/dto/client/auth';
	import { getValidationResult } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { type ValidationResult, type FormActions, type FormConfig, Form } from '$lib/models/ui';
	import { customForm } from '$lib/utils';

	const model = registerSchema().cast({}) as RegisterDto;
	let validationResult: ValidationResult;
	let actions: FormActions<RegisterDto>;
	let touched = $state(false);

	const config: FormConfig<RegisterDto> = {
		schema: registerSchema(),
		onSubmit,
		onTouched: () => (touched = true),
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterDto, result: ValidationResult): Promise<void> {
		touched = true;
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			delete model.confirmPassword;
			validationResult = getValidationResult(await apiResources.publicUser.registerManager(model));
			await loading.dismiss();
			if (validationResult.valid) {
				actions.resetModel();
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
		<form use:customForm={form}>
			<InputItem
				name="name"
				label={$t('routes.auth.register.form.input.surname')}
				iconSrc={personOutline}
			/>
			<InputItem
				name="surname"
				label={$t('routes.auth.register.form.input.name')}
				iconSrc={peopleOutline}
			/>
			<InputItem
				name="username"
				label={$t('routes.auth.register.form.input.username')}
				iconSrc={personCircleOutline}
			/>
			<InputItem
				name="email"
				type="email"
				label={$t('routes.auth.register.form.input.email')}
				iconSrc={mailOutline}
			/>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.register.form.input.password')}
				iconSrc={keyOutline}
			/>
			<InputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.register.form.input.confirm-password')}
				iconSrc={keySharp}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.register.form.submit')}
				disabled={!touched}
				iconSrc={saveOutline}
			/>
		</form>
		<Card click={() => goto(PageRoute.AUTH.LOGIN)} classProp="text-center">
			{$t('routes.auth.register.login.text')}
			<ion-text color="tertiary">{$t('routes.auth.register.login.link')}</ion-text>
		</Card>
	</Card>
</Layout>
