<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';

	import { format } from 'date-fns';
	import { loadingController } from 'ionic-svelte';
	import {
		archiveOutline,
		calendarClearOutline,
		calendarOutline,
		checkmarkDoneOutline,
		createOutline,
		documentOutline,
		documentsOutline,
		flashOutline,
		locationOutline,
		trashBinOutline
	} from 'ionicons/icons';
	import { fade } from 'svelte/transition';

	import {
		type CreateActivityDto,
		createActivitySchema,
		type UpdateActivityDto,
		updateActivitySchema
	} from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import ActivityCard from '$lib/components/widgets/ActivityCard.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Calendar from '$lib/components/widgets/Calendar.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import CustomItem from '$lib/components/widgets/CustomItem.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import Modal from '$lib/components/widgets/Modal.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { activitiesStore, organizationStore } from '$lib/stores';
	import { customForm, getValidationResult, showAlert } from '$lib/utility';

	enum ActivityStatus {
		ALL = 'all',
		DONE = 'done',
		PENDING = 'pending'
	}

	let showPopoverCalendar = $state(false);
	let showSelectDateCalendar = $state(false);

	let createModalOpen = $state(false);
	let editModalOpen = $state(false);

	let searchActivityValue = $state('');
	let filteredActivities = $state<ActivityModel[]>([]);

	let selectedActivityId: number;
	let activityStatus = $state(ActivityStatus.PENDING);
	let selectedDate = $state(new Date().toISOString());

	let createActions: FormActions<CreateActivityDto>;
	let updateActions: FormActions<UpdateActivityDto>;

	const createConfig: FormConfig<CreateActivityDto> = {
		exposedActions: (exposedActions) => (createActions = exposedActions),
		onSubmit: onCreateSubmit,
		schema: createActivitySchema()
	};

	const updateConfig: FormConfig<UpdateActivityDto> = {
		exposedActions: (exposedActions) => (updateActions = exposedActions),
		onSubmit: onUpdateSubmit,
		schema: updateActivitySchema()
	};

	const createForm = new Form(createActivitySchema().cast({}) as CreateActivityDto, createConfig);
	let updateForm = $state(new Form(updateActivitySchema().cast({}) as UpdateActivityDto, updateConfig));

	$effect(() => {
		filteredActivities = $activitiesStore;
	});

	async function onCreateSubmit(model: CreateActivityDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await organizationResource.createActivity(organizationId, model));
				if (result.valid) {
					createActions.resetModel();
					createModalOpen = false;
					await activitiesStore.init(organizationId);
				} else {
					createActions.applyValidationFeedback(result);
				}
			} else {
				await showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
		}
	}

	async function onUpdateSubmit(model: UpdateActivityDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(
					await organizationResource.updateActivity(organizationId, selectedActivityId, model)
				);
				if (result.valid) {
					updateActions.resetModel();
					editModalOpen = false;
				} else {
					updateActions.applyValidationFeedback(result);
				}
			} else {
				showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
		}
	}

	function onCreateActivity(): void {
		createModalOpen = true;
	}

	function onEditActivity(activity: ActivityModel): void {
		selectedActivityId = activity.id;
		updateForm = new Form(activity, updateConfig);
		editModalOpen = true;
	}

	function onArchiveEvent(): Promise<void> {
		return showAlert('Feature not implemented yet.');
	}

	async function onDeleteActivity(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const result = getValidationResult(await organizationResource.deleteActivity(organizationId, selectedActivityId));
			if (result.valid) {
				await activitiesStore.init(organizationId);
				editModalOpen = false;
			}
		} else {
			showAlert($t('routes.organization.page.activity.no-organization-id'));
		}
		await loader.dismiss();
	}

	function onCancelCreateModal(): void {
		createModalOpen = false;
	}

	function onCancelEditModal(): void {
		editModalOpen = false;
	}

	function onSearchEvents(event: CustomEvent): void {
		searchActivityValue = event.detail.value ?? '';
		filteredActivities = $activitiesStore.filter((activity) =>
			activity.name.toLowerCase().includes(searchActivityValue)
		);
	}

	function onFilterByStatus(status: ActivityStatus): void {
		void status;
		filteredActivities = $activitiesStore;
	}
</script>

<Layout title={$t('routes.organization.page.activity.title')} showBackButton scrollable={false}>
	{#if $activitiesStore.length === 0}
		<Calendar apply={onCreateActivity}></Calendar>
	{/if}

	<Button
		click={onCreateActivity}
		label={$t('routes.organization.page.activity.button.create-event')}
		expand="block"
		icon={createOutline}
	></Button>

	{#if $activitiesStore.length > 0}
		<!-- svelte-ignore event_directive_deprecated -->
		<div class="mx-2 mt-4">
			<ion-toggle
				alignment="center"
				color="secondary"
				checked={showPopoverCalendar}
				on:ionChange={(event) => (showPopoverCalendar = event.detail.checked)}
			>
				{$t('routes.organization.page.activity.show-calendar-toggle.label')}
			</ion-toggle>
		</div>

		<!-- svelte-ignore event_directive_deprecated -->
		<ion-searchbar
			class="mt-4"
			color="light"
			show-clear-button="always"
			debounce={100}
			placeholder={$t('routes.organization.page.activity.search.placeholder')}
			on:ionInput={onSearchEvents}
			value={searchActivityValue}
		></ion-searchbar>

		{#if !searchActivityValue}
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-segment
				in:fade={{ delay: 150, duration: 100 }}
				out:fade={{ delay: 0, duration: 100 }}
				on:ionChange={(event) => onFilterByStatus(event.detail.value as ActivityStatus)}
				value={activityStatus}
			>
				<ion-segment-button value={ActivityStatus.PENDING}>
					<ion-icon icon={flashOutline}></ion-icon>
					<ion-label>{$t('routes.organization.page.activity.segments.pending')}</ion-label>
				</ion-segment-button>
				<ion-segment-button value={ActivityStatus.DONE}>
					<ion-icon icon={checkmarkDoneOutline}></ion-icon>
					<ion-label>{$t('routes.organization.page.activity.segments.done')}</ion-label>
				</ion-segment-button>
				<ion-segment-button value={ActivityStatus.ALL}>
					<ion-icon icon={documentsOutline}></ion-icon>
					<ion-label>{$t('routes.organization.page.activity.segments.all')}</ion-label>
				</ion-segment-button>
			</ion-segment>
			<ion-segment-view in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				<ion-segment-content>
					<div class="max-h-[calc(100vh-360px)] overflow-y-auto">
						<ion-list in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
							{#each filteredActivities as activity (activity.id)}
								<ActivityCard value={activity} edit={onEditActivity} />
							{/each}
						</ion-list>
					</div>
				</ion-segment-content>
			</ion-segment-view>
		{:else if filteredActivities.length > 0}
			<ion-list in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				{#each filteredActivities as activity (activity.id)}
					<ActivityCard value={activity} edit={() => onEditActivity(activity)} />
				{/each}
			</ion-list>
		{:else}
			<div class="mt-4 text-center" in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				{$t('routes.organization.page.activity.no-activities-found', { value: searchActivityValue })}
			</div>
		{/if}
	{/if}
</Layout>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={showPopoverCalendar} on:didDismiss={() => (showPopoverCalendar = false)}>
	<div class="text-center">
		<Calendar
			applyText={$t('routes.organization.page.activity.calendar.done')}
			apply={onCreateActivity}
			dismiss={() => {
				showPopoverCalendar = false;
			}}
		></Calendar>
	</div>
</ion-popover>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={showSelectDateCalendar} on:didDismiss={() => (showSelectDateCalendar = false)}>
	<div class="text-center">
		<Calendar
			apply={(value) => {
				selectedDate = value;
			}}
			dismiss={() => {
				showSelectDateCalendar = false;
			}}
		></Calendar>
	</div>
</ion-popover>

<Modal
	open={createModalOpen}
	dismissed={() => {
		createModalOpen = false;
	}}
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
				icon={calendarOutline}
				inputIcon={calendarOutline}
				value={selectedDate}
				inputIconClick={() => {
					showSelectDateCalendar = true;
				}}
			/>
		</form>
	</Card>
</Modal>

{#key updateForm}
	<Modal
		dismissed={() => {
			editModalOpen = false;
		}}
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
				<CustomItem iconStart={calendarClearOutline}>
					<Button
						classProp="ms-[-8px]"
						fill="clear"
						color="dark"
						size="default"
						type="button"
						click={() => {
							showSelectDateCalendar = true;
						}}
						label={format(selectedDate, 'PPP')}
					></Button>
				</CustomItem>
			</form>
		</Card>
		<Card title={$t('routes.organization.page.activity.edit-modal.card.more-actions.title')}>
			<div class="flex items-center justify-center gap-4 text-center">
				<Button color="tertiary" icon={archiveOutline} label="Archive" click={onArchiveEvent}></Button>
				<Button color="danger" icon={trashBinOutline} label="Delete" click={() => onDeleteActivity()}></Button>
			</div>
		</Card>
	</Modal>
{/key}

<ion-modal>
	<ion-datetime id="datetime-selector"></ion-datetime>
</ion-modal>

<style>
	ion-popover {
		--width: 95%;
	}
</style>
