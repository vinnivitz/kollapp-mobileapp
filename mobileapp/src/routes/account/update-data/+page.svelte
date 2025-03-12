<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { mailOutline, peopleCircleOutline, personCircleOutline, personOutline, saveOutline } from 'ionicons/icons';

	import { type UpdateUserDataDto, updateUserDataSchema } from '$lib/api/dto/client/user';
	import { userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import type { UserModel } from '$lib/models/models';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import { customForm, getValidationResult } from '$lib/utils';

	let validationResult: ValidationResult;
	let actions: FormActions<UpdateUserDataDto>;
	let form = $state<Form<UpdateUserDataDto>>();
	let userModel = $derived<UserModel | undefined>($userStore);
	let model: UpdateUserDataDto;
	let touched = $state(false);

	const config: FormConfig<UpdateUserDataDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: updateUserDataSchema()
	};

	$effect(() => {
		if (userModel) {
			model = updateUserDataSchema().cast({
				email: userModel.email,
				name: userModel.name,
				surname: userModel.surname,
				username: userModel.username
			}) as UpdateUserDataDto;

			form = new Form(model, config);
		}
	});

	async function onSubmit(model: UpdateUserDataDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(await userResource.update(model));
			if (validationResult.valid) {
				await userStore.init();
				touched = false;
			} else {
				actions.applyValidationFeedback(validationResult);
			}
			await loading.dismiss();
		}
	}
</script>

<Layout title={$t('routes.account.update-data.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.account.update-data.card.title')}>
			<form use:customForm={form}>
				<InputItem name="name" label={$t('routes.account.update-data.card.form.name')} icon={personCircleOutline} />
				<InputItem
					name="surname"
					label={$t('routes.account.update-data.card.form.surename')}
					icon={peopleCircleOutline}
				/>
				<InputItem name="username" label={$t('routes.account.update-data.card.form.username')} icon={personOutline} />
				<InputItem
					name="email"
					label={$t('routes.account.update-data.card.form.email')}
					icon={mailOutline}
					type="email"
				/>
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.account.update-data.card.form.button.submit')}
					icon={saveOutline}
				/>
			</form>
		</Card>
	{/if}
</Layout>
