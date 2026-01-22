<script lang="ts">
	import type { OrganizationCreationRequestTO } from '@kollapp/api-types';

	import { accessibilityOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createOrganizationSchema } from '$lib/api/schema/organization';
	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm } from '$lib/utility';

	const form = new Form({
		completed: async ({ response }) => {
			await organizationStore.initialize();
			await organizationStore.update(response.id);
			await goto(resolve('/organization'));
		},
		request: async (model: OrganizationCreationRequestTO) => organizationService.create(model),
		schema: createOrganizationSchema()
	});
</script>

<Layout title={$t('routes.organization.register.page.title')} showBackButton>
	<Card title={$t('routes.organization.register.page.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="name"
				label={$t('routes.organization.register.page.card.form.name')}
				icon={accessibilityOutline}
			/>
			<TextareaInputItem
				name="description"
				icon={readerOutline}
				label={$t('routes.organization.register.page.card.form.description')}
			></TextareaInputItem>
			<LocationInputItem name="place" label={$t('routes.organization.register.page.card.form.place')} />
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.organization.register.page.card.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
