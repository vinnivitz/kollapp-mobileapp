<script lang="ts">
	import { keyOutline, keySharp, mailOpenOutline, mailOutline, personCircleOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { registerSchema } from '$lib/api/schema/authentication';
	import { publicUserService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, informationModal, passwordConfirmationValidator } from '$lib/utility';

	const form = new Form({
		completed: async ({ model }) => {
			await informationModal(
				$t('routes.auth.register.page.modal.success.title'),
				$t('routes.auth.register.page.modal.success.message', { value: model.email })
			);
			await goto(resolve('/auth/login'));
		},
		customValidators: {
			confirmPassword: passwordConfirmationValidator('password', 'confirmPassword')
		},
		request: async (model) => await publicUserService.register(model),
		schema: registerSchema()
	});
</script>

<Layout>
	<div class="mb-6">
		<Welcome />
	</div>
	{@render joinCard()}
	{@render registerCard()}
</Layout>

<!-- Snippets -->

{#snippet joinCard()}
	<Card title={$t('routes.auth.register.page.card.join.title')}>
		<div class="flex items-center gap-4">
			<ion-icon icon={mailOpenOutline} size="large" class="flex-none"></ion-icon>
			<ion-text class="flex-auto">
				{$t('routes.auth.register.page.card.join.content')}
			</ion-text>
		</div>
	</Card>
{/snippet}

{#snippet registerCard()}
	<Card title={$t('routes.auth.register.page.card.register.title')}>
		<form use:customForm={form}>
			<InputItem
				name="username"
				label={$t('routes.auth.register.page.card.register.form.username')}
				icon={personCircleOutline}
			/>
			<InputItem
				name="email"
				inputmode="email"
				type="email"
				label={$t('routes.auth.register.page.card.register.form.email')}
				icon={mailOutline}
			/>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.auth.register.page.card.register.form.password')}
				icon={keyOutline}
			/>
			<InputItem
				name="confirmPassword"
				type="password"
				label={$t('routes.auth.register.page.card.register.form.confirm-password')}
				icon={keySharp}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.register.page.card.register.form.submit')}
				icon={saveOutline}
			/>
		</form>
		<Card clicked={() => goto(resolve('/auth/login'))} classList="text-center flex flex-wrap gap-1">
			<ion-text>{$t('routes.auth.register.page.card.register.card.login.content')}</ion-text>
			<ion-text color="secondary">{$t('routes.auth.register.page.card.register.card.login.link')}</ion-text>
		</Card>
	</Card>
{/snippet}
