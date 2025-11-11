<script lang="ts">
	import { accessibilityOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type CreateOrganizationDto, createOrganizationSchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm } from '$lib/utility';

	const form = new Form({
		completed: async ({ response }) => {
			await organizationStore.init();
			await organizationStore.update(response.id);
			goto(PageRoute.ORGANIZATION.ROOT);
		},
		request: async (model: CreateOrganizationDto) => organizationResource.create(model),
		schema: createOrganizationSchema()
	});
</script>

<Layout title={$t('routes.auth.register.organization.title')} showBackButton>
	<Card title={$t('routes.auth.register.organization.form.title')}>
		<form use:customForm={form}>
			<TextInputItem
				name="name"
				label={$t('routes.auth.register.organization.form.input.name')}
				icon={accessibilityOutline}
			/>
			<TextareaInputItem
				name="description"
				icon={readerOutline}
				label={$t('routes.organization.page.register.form.description')}
			></TextareaInputItem>
			<LocationInputItem name="place" label={$t('routes.organization.page.register.form.place')} />
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.auth.register.organization.form.submit')}
				icon={saveOutline}
			/>
		</form>
	</Card>
</Layout>
