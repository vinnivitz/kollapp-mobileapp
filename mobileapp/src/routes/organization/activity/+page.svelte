<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { calendarOutline, createOutline, documentOutline, locationOutline } from 'ionicons/icons';
	import moment from 'moment';

	import {
		createActivitySchema,
		updateActivitySchema,
		type CreateActivityDto,
		type UpdateActivityDto
	} from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import ActivityCard from '$lib/components/widgets/ActivityCard.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Modal from '$lib/components/widgets/Modal.svelte';
	import { locale, t } from '$lib/locales';
	import type { ActivityModel } from '$lib/models/models';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { activitiesStore, organizationStore } from '$lib/stores';
	import { clickOutside, customForm, getValidationResult, showAlert } from '$lib/utils';

	let calendar: HTMLIonDatetimeElement;
	let showCalendar = $state(false);
	let createModalOpen = $state(false);
	let editModalOpen = $state(false);
	let searchActivityValue = $state('');
	let searchedActivities = $state<ActivityModel[]>([]);
	let selectedActivityId: string;

	let createActions: FormActions<CreateActivityDto>;
	let updateActions: FormActions<UpdateActivityDto>;

	const createConfig: FormConfig<CreateActivityDto> = {
		schema: createActivitySchema(),
		onSubmit: onCreateSubmit,
		exposedActions: (exposedActions) => (createActions = exposedActions)
	};

	const updateConfig: FormConfig<UpdateActivityDto> = {
		schema: updateActivitySchema(),
		onSubmit: onUpdateSubmit,
		exposedActions: (exposedActions) => (updateActions = exposedActions)
	};

	const createForm = new Form(createActivitySchema().cast({}) as CreateActivityDto, createConfig);
	let updateForm = $state(new Form(updateActivitySchema().cast({}) as UpdateActivityDto, updateConfig));

	$effect(() => {
		searchedActivities = $activitiesStore;
	});

	async function onCreateSubmit(model: CreateActivityDto, result: ValidationResult) {
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
				createActions.resetModel();
				createModalOpen = false;
			} else {
				createActions.applyValidationFeedback(result);
			}
		}
	}

	async function onUpdateSubmit(model: UpdateActivityDto, result: ValidationResult) {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(
					await organizationResource.updateActivity(organizationId, selectedActivityId, model)
				);
			} else {
				showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
			if (result.valid) {
				updateActions.resetModel();
				editModalOpen = false;
			} else {
				updateActions.applyValidationFeedback(result);
			}
		}
	}

	function onCreateActivity() {
		createModalOpen = true;
	}

	function onEditActivity(activity: ActivityModel) {
		selectedActivityId = activity.id;
		updateForm = new Form(activity, updateConfig);
		editModalOpen = true;
	}

	function onCancelCreateModal() {
		createModalOpen = false;
	}

	function onCancelEditModal() {
		editModalOpen = false;
	}

	function onSearchEvents(event: CustomEvent) {
		searchActivityValue = event.detail.value ?? '';
		searchedActivities = $activitiesStore.filter((activity) =>
			activity.name.toLowerCase().includes(searchActivityValue)
		);
	}
</script>

<Layout title={$t('routes.organization.page.activity.title')} showBackButton>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-searchbar
		color="light"
		show-clear-button="always"
		debounce={100}
		placeholder={$t('components.layout.menu.searchbar.placeholder')}
		on:ionInput={onSearchEvents}
		value={searchActivityValue}
	></ion-searchbar>

	<!-- svelte-ignore event_directive_deprecated -->
	<div class="mx-4">
		<ion-toggle
			alignment="center"
			color="secondary"
			checked={showCalendar}
			on:ionChange={(event) => (showCalendar = event.detail.checked)}
		>
			{$t('routes.organization.page.activity.show-calendar-toggle.label')}
		</ion-toggle>
	</div>

	<div class="mx-2 mt-4 flex items-center justify-between">
		<Button click={() => {}} label="Create event" icon={createOutline}></Button>
		<Button click={() => {}} label="Create event" icon={createOutline}></Button>
	</div>

	<ion-list>
		{#each searchedActivities as activity (activity.id)}
			<ActivityCard {activity} click={() => onEditActivity(activity)} />
		{/each}
	</ion-list>
</Layout>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={showCalendar} on:didDismiss={() => (showCalendar = false)}>
	<div class="text-center">
		<ion-datetime
			show-default-buttons
			show-default-title
			cancel-text={$t('routes.organization.page.activity.calendar.cancel')}
			done-text={$t('routes.organization.page.activity.calendar.done')}
			use:clickOutside
			on:blur={() => calendar.reset()}
			color="secondary"
			size="cover"
			max={moment().add(10, 'years').format('YYYY-MM-DD')}
			bind:this={calendar}
			on:ionChange={onCreateActivity}
			locale={$locale}
			first-day-of-week={1}
			presentation="date"
		>
			<span slot="title">{$t('routes.organization.page.activity.calendar.title')}</span>
		</ion-datetime>
	</div>
</ion-popover>

<Modal
	open={createModalOpen}
	cancel={onCancelCreateModal}
	confirm={() => createActions.onSubmit()}
	confirmLabel={$t('routes.organization.page.activity.create-modal.button.confirm')}
>
	<Card title={$t('routes.organization.page.activity.create-modal.card.title')}>
		<form use:customForm={createForm}>
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

{#key updateForm}
	<Modal
		open={editModalOpen}
		cancel={onCancelEditModal}
		confirm={() => updateActions.onSubmit()}
		confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
	>
		<Card title={$t('routes.organization.page.activity.edit-modal.card.title')}>
			<form use:customForm={updateForm}>
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
{/key}

<style lang="postcss">
	ion-popover {
		--width: 95%;
	}
</style>
