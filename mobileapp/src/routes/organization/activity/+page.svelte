<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { calendarOutline, documentOutline, locationOutline } from 'ionicons/icons';
	import moment from 'moment';
	import { onMount } from 'svelte';

	import { createActivitySchema, type CreateActivityDto } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Modal from '$lib/components/widgets/Modal.svelte';
	import { locale, t } from '$lib/locales';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { clickOutside, customForm, getValidationResult, showAlert } from '$lib/utils';

	const activityDates = $state<string[]>([moment().subtract(2, 'days').format('YYYY-MM-DD')]);

	let calendar: HTMLIonDatetimeElement;
	let createModalOpen = $state(false);

	const model = createActivitySchema().cast({}) as CreateActivityDto;
	let actions: FormActions<CreateActivityDto>;

	const config: FormConfig<CreateActivityDto> = {
		schema: createActivitySchema(),
		onSubmit,
		exposedActions: (exposedActions) => (actions = exposedActions)
	};

	const form = new Form(model, config);

	async function onSubmit(model: CreateActivityDto, result: ValidationResult) {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await organizationResource.createActivity(organizationId, model));
			} else {
				showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
			if (result.valid) {
				actions.resetModel();
				createModalOpen = false;
			} else {
				actions.applyValidationFeedback(result);
			}
		}
	}

	function onCancel() {
		createModalOpen = false;
		actions.resetModel();
	}

	function onDateSelected(_value: string) {
		createModalOpen = true;
	}

	onMount(() => {
		calendar.highlightedDates = activityDates.map((date) => {
			return {
				date: date,
				backgroundColor: 'var(--ion-color-primary)',
				textColor: 'var(--ion-color-primary-contrast)'
			};
		});
	});
</script>

<Layout title={$t('routes.organization.page.activity.title')} showBackButton>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-datetime
		use:clickOutside
		size="cover"
		on:blur={() => calendar.reset()}
		color="secondary"
		max={moment().add(10, 'years').format('YYYY-MM-DD')}
		bind:this={calendar}
		on:ionChange={(event) => onDateSelected(event.detail.value as string)}
		locale={$locale}
		first-day-of-week={1}
		presentation="date"
	></ion-datetime>
</Layout>

<Modal
	open={createModalOpen}
	cancel={onCancel}
	title={$t('routes.organization.page.activity.create-modal.title')}
	confirm={() => actions.onSubmit()}
>
	<Card title={$t('routes.organization.page.activity.create-modal.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="name"
				label={$t('routes.organization.page.activity.create-modal.card.input.name')}
				icon={documentOutline}
			/>
			<InputItem
				name="location"
				label={$t('routes.organization.page.activity.create-modal.card.input.location')}
				icon={locationOutline}
			/>
			<InputItem
				name="date"
				label={$t('routes.organization.page.activity.create-modal.card.input.date')}
				type="date"
				icon={calendarOutline}
			/>
		</form>
	</Card>
</Modal>
