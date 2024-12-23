<script lang="ts">
	import { loadingController } from 'ionic-svelte';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { loginSchema, type LoginDto } from '$lib/api/dto';
	import { getValidationResult, storeTokens } from '$lib/api/utils';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import {
		type ValidationResult,
		type FormActions,
		type FormConfig,
		Form,
		PageRoute
	} from '$lib/models';
	import { organizationStore } from '$lib/store';
	import { clickableElement, customForm } from '$lib/utils';

	const model = loginSchema().cast({}) as LoginDto;
	let validationResult: ValidationResult;
	let actions: FormActions<LoginDto>;

	const config: FormConfig<LoginDto> = {
		schema: loginSchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: LoginDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			const body = await apiResources.auth.login(model);
			validationResult = getValidationResult(body);
			if (validationResult.valid) {
				await storeTokens(body.data);
				await organizationStore.init();
				await goto(PageRoute.HOME);
			} else {
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.auth.login.title')} showBackButton>
	<Card title={$t('routes.auth.login.form.title')}>
		<form use:customForm={form}>
			<ion-item>
				<ion-input name="username" label={$t('routes.auth.login.form.input.username')}></ion-input>
			</ion-item>
			<ion-item>
				<ion-input
					name="password"
					type="password"
					label={$t('routes.auth.login.form.input.password')}
				></ion-input>
			</ion-item>
			<ion-button class="mt-3" expand="block" type="submit">
				{$t('routes.auth.login.form.submit')}
			</ion-button>
		</form>
		<Card>
			<div class="text-center" use:clickableElement={() => goto(PageRoute.AUTH_REGISTER)}>
				{$t('routes.auth.login.register.text')}
				<span class="text-[--ion-color-secondary]">{$t('routes.auth.login.register.link')}</span>
			</div>
		</Card>
		<Card>
			<div class="text-center" use:clickableElement={() => goto(PageRoute.AUTH_RESET_PASSWORD)}>
				{$t('routes.auth.login.forgot-password.text')}
				<span class="text-[--ion-color-secondary]">
					{$t('routes.auth.login.forgot-password.link')}
				</span>
			</div>
		</Card>
	</Card>
</Layout>
