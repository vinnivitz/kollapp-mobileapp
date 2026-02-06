<script lang="ts">
	import type { KollappUserUpdateRequestTO } from '@kollapp/api-types';

	import { mailOutline, personOutline, saveOutline } from 'ionicons/icons';

	import { updateUserDataSchema } from '$lib/api/schemas/user';
	import { userService } from '$lib/api/services';
	import { Button, Card, InputItem } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { userStore } from '$lib/stores';
	import { customForm, informationModal } from '$lib/utility';

	let touched = $state<boolean>(false);
	let currentEmail = $state<string>();

	const form = new Form({
		actions: (actions) => {
			actions.set({
				email: $userStore?.email!,
				username: $userStore?.username!
			});
		},
		completed: async ({ model }) => {
			if (currentEmail !== model.email) {
				await informationModal(
					$t('routes.account.update-data.page.modal.message'),
					$t('routes.account.update-data.page.modal.title', { value: model.email })
				);
			}
		},
		failed: () => (touched = false),
		onTouched: () => (touched = true),
		request: async (model: KollappUserUpdateRequestTO) => {
			currentEmail = $userStore?.email;
			return userService.update(model);
		},
		schema: updateUserDataSchema()
	});
</script>

<Layout title={$t('routes.account.update-data.page.title')} showBackButton>
	<Card title={$t('routes.account.update-data.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="username"
				label={$t('routes.account.update-data.page.card.form.username')}
				icon={personOutline}
				helperText={$t('routes.account.update-data.page.card.form.username-helper-text')}
			/>
			<InputItem
				name="email"
				inputmode="email"
				label={$t('routes.account.update-data.page.card.form.email')}
				icon={mailOutline}
				type="email"
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				disabled={!touched}
				label={$t('routes.account.update-data.page.card.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
