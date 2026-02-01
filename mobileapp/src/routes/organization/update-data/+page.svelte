<script lang="ts">
	import { accessibilityOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { updateOrganizationSchema } from '$lib/api/schema/organization';
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

	let touched = $state<boolean>(false);

	const form = new Form({
		completed: async () => (touched = false),
		failed: () => (touched = false),
		onTouched: () => (touched = true),
		request: async (model) => organizationService.update($organizationStore?.id!, model),
		schema: updateOrganizationSchema({
			description: $organizationStore?.description,
			name: $organizationStore?.name!,
			place: $organizationStore?.place!
		})
	});
</script>

<Layout title={$t('routes.organization.update-data.page.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.organization.update-data.page.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="name"
					label={$t('routes.organization.update-data.page.card.form.name')}
					icon={accessibilityOutline}
				/>
				<TextareaInputItem
					name="description"
					label={$t('routes.organization.update-data.page.card.form.description')}
					icon={readerOutline}
				></TextareaInputItem>
				<LocationInputItem name="place" label={$t('routes.organization.update-data.page.card.form.place')} />
				<Button
					classList="mt-3"
					expand="block"
					type="submit"
					disabled={!touched}
					label={$t('routes.organization.update-data.page.card.form.submit')}
					icon={saveOutline}
				/>
			</form>
		</Card>
	{/if}
</Layout>
