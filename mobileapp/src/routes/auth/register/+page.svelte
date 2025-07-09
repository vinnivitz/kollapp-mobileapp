<script lang="ts">
	import { keyOutline, keySharp, mailOpenOutline, mailOutline, personCircleOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { registerSchema } from '$lib/api/dto/client/auth';
	import { publicUserResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import Welcome from '$lib/components/widgets/Welcome.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import { customForm } from '$lib/utility';

	const form = new Form({
		completed: async () => goto(PageRoute.AUTH.LOGIN),
		request: async (model) => {
			delete model.confirmPassword;
			return publicUserResource.register(model);
		},
		schema: registerSchema()
	});
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
		<TextInputItem name="username" label={$t('routes.auth.register.form.input.username')} icon={personCircleOutline} />
		<TextInputItem name="email" inputmode="email" type="email" label={$t('routes.auth.register.form.input.email')} icon={mailOutline} />
		<TextInputItem
			name="password"
			type="password"
			label={$t('routes.auth.register.form.input.password')}
			icon={keyOutline}
		/>
		<TextInputItem
			name="confirmPassword"
			type="password"
			label={$t('routes.auth.register.form.input.confirm-password')}
			icon={keySharp}
		/>
		<Button
			classList="mt-3"
			expand="block"
			type="submit"
			label={$t('routes.auth.register.form.submit')}
			icon={saveOutline}
		/>
	</form>
	<Card clicked={() => goto(PageRoute.AUTH.LOGIN)} classList="text-center">
		{$t('routes.auth.register.login.text')}
		<ion-text color="secondary">{$t('routes.auth.register.login.link')}</ion-text>
	</Card>
{/snippet}
