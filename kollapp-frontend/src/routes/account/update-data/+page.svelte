<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { mailOutline, peopleOutline, personCircleOutline, personOutline } from 'ionicons/icons';

	import { apiResources } from '$lib/api';
	import { updateUserDataSchema, type UpdateUserDataDto } from '$lib/api/dto/client';
	import { getValidationResult } from '$lib/api/utils';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import { t } from '$lib/locales';
	import type { UserModel } from '$lib/models/store';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { userStore } from '$lib/store';
	import { customForm } from '$lib/utils';

	let validationResult: ValidationResult;
	let actions: FormActions<UpdateUserDataDto>;
	let form = $state<Form<UpdateUserDataDto>>();
	let userModel = $derived<UserModel | undefined>($userStore);
	let model: UpdateUserDataDto;
	let touched = $state(false);

	const config: FormConfig<UpdateUserDataDto> = {
		schema: updateUserDataSchema(),
		onSubmit,
		onTouched: () => (touched = true),
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	$effect(() => {
		if (userModel) {
			model = updateUserDataSchema().cast({
				surname: userModel.surname,
				name: userModel.name,
				username: userModel.username,
				email: userModel.email
			}) as UpdateUserDataDto;

			form = new Form(model, config);
		}
	});

	async function onSubmit(model: UpdateUserDataDto, result: ValidationResult): Promise<void> {
		validationResult = result;
		if (validationResult.valid) {
			const loading = await loadingController.create({});
			await loading.present();
			validationResult = getValidationResult(await apiResources.user.updateUserData(model));
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

<IonLayout title={$t('routes.account.update-data.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.account.update-data.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="name"
					label={$t('routes.account.update-data.card.form.name')}
					iconSrc={personOutline}
				/>
				<InputItem
					name="surname"
					label={$t('routes.account.update-data.card.form.surename')}
					iconSrc={peopleOutline}
				/>
				<InputItem
					name="username"
					label={$t('routes.account.update-data.card.form.username')}
					iconSrc={personCircleOutline}
				/>
				<InputItem
					name="email"
					label={$t('routes.account.update-data.card.form.email')}
					iconSrc={mailOutline}
					type="email"
				/>
				<Button
					classProp="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.account.update-data.card.form.button.submit')}
				/>
			</form>
		</Card>
	{/if}
</IonLayout>
