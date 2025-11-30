<script lang="ts">
	import { keyOutline, keySharp, mailOpenOutline, mailOutline, personCircleOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { publicUserService } from '$lib/api/services';
	import { registerSchema } from '$lib/api/validation/authentication';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { customForm, passwordConfirmationValidator } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(resolve('/auth/login')),
		customValidators: [passwordConfirmationValidator('password', 'confirmPassword')],
		request: async (model) => publicUserService.register(model),
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
			<TextInputItem
				name="username"
				label={$t('routes.auth.register.page.card.register.form.username')}
				icon={personCircleOutline}
			/>
			<TextInputItem
				name="email"
				inputmode="email"
				type="email"
				label={$t('routes.auth.register.page.card.register.form.email')}
				icon={mailOutline}
			/>
			<TextInputItem
				name="password"
				type="password"
				label={$t('routes.auth.register.page.card.register.form.password')}
				icon={keyOutline}
			/>
			<TextInputItem
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
