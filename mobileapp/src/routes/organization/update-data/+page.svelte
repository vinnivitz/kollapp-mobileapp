<script lang="ts">
	import { accessibilityOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { organizationResource } from '$lib/api/resources';
	import { updateOrganizationSchema } from '$lib/api/validation/organization';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm } from '$lib/utility';

	let touched = $state(false);

	const form = new Form({
		completed: async () => {
			await organizationStore.init();
			touched = false;
		},
		exposedActions: (actions) => {
			actions?.setModel({
				description: $organizationStore!.description,
				name: $organizationStore!.name,
				place: $organizationStore!.place
			});
		},
		failed: () => (touched = false),
		initialModel: {
			description: $organizationStore!.description,
			name: $organizationStore!.name,
			place: $organizationStore!.place
		},
		onTouched: () => (touched = true),
		request: async (model) => organizationResource.update($organizationStore?.id!, model),
		schema: updateOrganizationSchema()
	});
</script>

<Layout title={$t('routes.organization.update-info.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.organization.update-info.card.title')}>
			<form use:customForm={form}>
				<TextInputItem
					name="name"
					label={$t('routes.auth.register.organization.form.input.name')}
					icon={accessibilityOutline}
				/>
				<TextareaInputItem
					name="description"
					label={$t('routes.organization.page.update-data.form.description')}
					icon={readerOutline}
				></TextareaInputItem>
				<LocationInputItem name="place" label={$t('routes.organization.page.register.form.place')} />
				<Button
					classList="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.organization.update-info.card.button')}
					icon={saveOutline}
				/>
			</form>
		</Card>
	{/if}
</Layout>
