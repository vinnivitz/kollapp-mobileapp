<script lang="ts">
	import type { PageData } from './$types';

	import { loadingController } from 'ionic-svelte';
	import { keyOutline, keySharp } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type ResetPasswordConfirmationDto, resetPasswordConfirmationSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { customForm, getValidationResult, showAlert } from '$lib/utils';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		if (!data.token) {
			showAlert($t('routes.auth.reset-password.confirmation.no-token'));
			goto(PageRoute.AUTH.LOGIN);
		}
	});

	const model = resetPasswordConfirmationSchema().cast({}) as ResetPasswordConfirmationDto;
	let actions: FormActions<ResetPasswordConfirmationDto>;
	let touched = $state(false);

	const config: FormConfig<ResetPasswordConfirmationDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: resetPasswordConfirmationSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: ResetPasswordConfirmationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			delete model.confirmPassword;
			result = getValidationResult(await publicUserResource.resetPassword(model, data.token!));
			if (result.valid) {
				await goto(PageRoute.AUTH.LOGIN);
			} else {
				actions.applyValidationFeedback(result);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.auth.reset-password.confirmation.title')} showBackButton>
	<Card title={$t('routes.auth.reset-password.confirmation.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.password')}
				icon={keyOutline}
			/>
			<InputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.reset-password.confirmation.form.input.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classProp="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.reset-password.confirmation.form.submit')}
				disabled={!touched}
			/>
		</form>
	</Card>
</Layout>
