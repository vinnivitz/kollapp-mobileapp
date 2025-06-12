<script lang="ts">
	import type { OrganizationModel } from '$lib/models/models';

	import { loadingController } from 'ionic-svelte';
	import { accessibilityOutline, locationOutline, mapOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { type UpdateOrganizationDto, updateOrganizationSchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';
	import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, getValidationResult } from '$lib/utility';

	const organization = $derived<OrganizationModel | undefined>($organizationStore);
	let actions: FormActions<UpdateOrganizationDto>;
	let model: UpdateOrganizationDto;
	let form = $state<Form<UpdateOrganizationDto>>();
	let touched = $state(false);
	let mapModalOpen = $state(false);
	let selectedLocation = $state('');

	const config: FormConfig<UpdateOrganizationDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: updateOrganizationSchema()
	};

	$effect(() => {
		if (organization) {
			model = updateOrganizationSchema().cast({
				description: organization.description,
				name: organization.name,
				place: organization.place
			}) as UpdateOrganizationDto;

			form = new Form(model, config);
		}
	});

	async function onSubmit(model: UpdateOrganizationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			result = getValidationResult(await organizationResource.update(organization!.id, model));
			await loader.dismiss();
			if (result.valid) {
				actions.resetModel();
				touched = false;
				organizationStore.init();
			} else {
				actions.applyValidationFeedback(result);
			}
		}
	}

	function onCancelMapModal(): void {
		mapModalOpen = false;
		selectedLocation = '';
	}

	function onConfirmMap(): void {
		mapModalOpen = false;
		actions.onUpdate('place', selectedLocation);
	}
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
				<InputItem
					name="place"
					label={$t('routes.organization.page.register.form.place')}
					icon={locationOutline}
					inputIcon={mapOutline}
					inputIconClick={() => (mapModalOpen = true)}
					value={selectedLocation}
				/>
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

<Modal open={mapModalOpen} confirm={onConfirmMap} dismissed={() => (mapModalOpen = false)} cancel={onCancelMapModal}>
	{#if mapModalOpen}
		<LeafletMap selected={(location) => (selectedLocation = location)} classList="-m-4"></LeafletMap>
	{/if}
</Modal>
