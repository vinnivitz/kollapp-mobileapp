<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { accessibilityOutline, locationOutline, mapOutline, readerOutline, saveOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type RegisterOrganizationDto, registerOrganizationSchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';
	import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, getValidationResult } from '$lib/utility';

	const model = registerOrganizationSchema().cast({}) as RegisterOrganizationDto;
	let actions: FormActions<RegisterOrganizationDto>;
	let touched = $state(false);
	let mapModalOpen = $state(false);
	let selectedLocation = $state('');

	const config: FormConfig<RegisterOrganizationDto> = {
		exposedActions: (exposedActions) => (actions = exposedActions),
		onSubmit,
		onTouched: () => (touched = true),
		schema: registerOrganizationSchema()
	};

	const form = new Form(model, config);

	async function onSubmit(model: RegisterOrganizationDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const response = await organizationResource.create(model);
			result = getValidationResult(response);
			await loader.dismiss();
			if (result.valid) {
				actions.resetModel();
				await organizationStore.init();
				await organizationStore.update(response.data.id);
				goto(PageRoute.ORGANIZATION.ROOT);
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

<Layout title={$t('routes.auth.register.organization.title')} showBackButton>
	<Card title={$t('routes.auth.register.organization.form.title')}>
		<form use:customForm={form}>
			<InputItem
				name="name"
				label={$t('routes.auth.register.organization.form.input.name')}
				icon={accessibilityOutline}
			/>
			<TextareaItem
				name="description"
				icon={readerOutline}
				label={$t('routes.organization.page.register.form.description')}
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
				label={$t('routes.auth.register.organization.form.submit')}
				icon={saveOutline}
				disabled={!touched}
			/>
		</form>
	</Card>
</Layout>

<Modal open={mapModalOpen} confirm={onConfirmMap} dismissed={() => (mapModalOpen = false)} cancel={onCancelMapModal}>
	{#if mapModalOpen}
		<LeafletMap selected={(location) => (selectedLocation = location)} classList="-m-4"></LeafletMap>
	{/if}
</Modal>
