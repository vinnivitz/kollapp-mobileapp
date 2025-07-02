<script lang="ts">
	import { accessibilityOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { type UpdateOrganizationDto, updateOrganizationSchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationItem from '$lib/components/widgets/ionic/LocationItem.svelte';
	import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm } from '$lib/utility';

	let touched = $state(false);

	let actions: FormActions<UpdateOrganizationDto>;

	const form = $derived(
		new Form({
			completed: async () => {
				await organizationStore.init();
				touched = false;
			},
			exposedActions: (exposedActions) => (actions = exposedActions),
			onTouched: () => (touched = true),
			request: async (model) => organizationResource.update($organizationStore?.id!, model),
			schema: updateOrganizationSchema()
		})
	);

	$effect(() => {
		if ($organizationStore) {
			actions?.setModel({
				description: $organizationStore.description,
				name: $organizationStore.name,
				place: $organizationStore.place
			});
		}
	});
</script>

<Layout title={$t('routes.organization.update-info.title')} showBackButton>
	{#if form}
		<Card title={$t('routes.organization.update-info.card.title')}>
			<form use:customForm={form}>
				<InputItem
					name="name"
					label={$t('routes.auth.register.organization.form.input.name')}
					icon={accessibilityOutline}
				/>
				<TextareaItem
					name="description"
					label={$t('routes.organization.page.update-data.form.description')}
					icon={readerOutline}
				></TextareaItem>
				<LocationItem name="place" label={$t('routes.organization.page.register.form.place')} />
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
