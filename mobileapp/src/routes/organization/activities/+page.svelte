<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';

	import { format } from 'date-fns';
	import { loadingController } from 'ionic-svelte';
	import {
		archiveOutline,
		calendarClearOutline,
		calendarOutline,
		closeOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOutline,
		locationOutline,
		mapOutline,
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
	import FabButton from '$lib/components/widgets/FabButton.svelte';
	import InputItem from '$lib/components/widgets/InputItem.svelte';
	import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';
	import Modal from '$lib/components/widgets/Modal.svelte';
	import SegmentButton from '$lib/components/widgets/SegmentButton.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { activitiesStore, organizationStore } from '$lib/stores';
	import { customForm, getValidationResult, showAlert } from '$lib/utility';

	enum ActivityView {
		activities = 'activities',
		calendar = 'calendar'
	}

	enum ActivityFilterType {
		archived = 'archived',
		pending = 'pending'
	}

	type ActivityFilter = {
		applied: boolean;
		label: string;
		type: ActivityFilterType;
	};

	const activityItems = $derived($activitiesStore ?? []);

	const activityFilters = $state<ActivityFilter[]>(initialActivityFilter());

	let activityView = $state(ActivityView.activities);

	let showSelectDateCalendar = $state(false);

	let showFilters = $state(false);

	let createModalOpen = $state(false);
	let editModalOpen = $state(false);
	let mapModalOpen = $state(false);

	let searchActivityValue = $state('');
	let filteredActivities = $state<ActivityModel[]>([]);

	let selectedActivityId: number;
	let selectedDate = $state(new Date().toISOString());
	let selectedLocation = $state<string>('');
	let cachedLocation = $state<string>('');

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
		filteredActivities = activityItems;
	});

	function initialActivityFilter(): ActivityFilter[] {
		return Object.values(ActivityFilterType).map((type) => ({
			applied: type === ActivityFilterType.pending,
			label: $t(`routes.organization.page.activity.filters.type.${type}`),
			type
		}));
	}

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
					await activitiesStore.init();
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
				await activitiesStore.init();
				editModalOpen = false;
			}
		} else {
			showAlert($t('routes.organization.page.activity.no-organization-id'));
		}
		await loader.dismiss();
	}

	function onCancelCreateModal(): void {
		createModalOpen = false;
		selectedLocation = '';
	}

	function onCancelEditModal(): void {
		editModalOpen = false;
		selectedLocation = '';
	}

	function onSearchEvents(event: CustomEvent): void {
		searchActivityValue = event.detail.value ?? '';
		filteredActivities = activityItems.filter((activity) => activity.name.toLowerCase().includes(searchActivityValue));
	}
</script>

<Layout
	title={$t('routes.organization.page.activity.title')}
	showBackButton
	scrollable={activityView === ActivityView.calendar}
>
	<div class="mb-1">
		{@render activitySegmentsHeader()}
	</div>
	{@render activitySegmentView()}
</Layout>

{#snippet activitySegmentsHeader()}
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-segment
		in:fade={{ delay: 150, duration: 100 }}
		out:fade={{ delay: 0, duration: 100 }}
		on:ionChange={(event) => (activityView = event.detail.value as ActivityView)}
		value={activityView}
		color="secondary"
	>
		<SegmentButton
			icon={flashOutline}
			label={$t('routes.organization.page.activity.segments.activities')}
			value={ActivityView.activities}
		></SegmentButton>
		<SegmentButton
			icon={calendarOutline}
			label={$t('routes.organization.page.activity.segments.calendar')}
			value={ActivityView.calendar}
			searchable={PageRoute.ORGANIZATION.ACTIVITIES}
		></SegmentButton>
	</ion-segment>
{/snippet}

{#snippet activitySegmentView()}
	<ion-segment-view in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
		<ion-segment-content>
			{#if activityView === ActivityView.activities}
				<FabButton
					id={$t('routes.organization.page.activity.create')}
					click={onCreateActivity}
					icon={createOutline}
					searchable={PageRoute.ORGANIZATION.ACTIVITIES}
				></FabButton>

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

				{@render activityFilter()}

				{@render activityList()}
			{:else if activityView === ActivityView.calendar}
				<Calendar
					apply={onCreateActivity}
					applyText={$t('routes.organization.page.activity.calendar.done')}
					dismissText=""
				></Calendar>
			{/if}
		</ion-segment-content>
	</ion-segment-view>
{/snippet}

{#snippet activityFilter()}
	<div class="mx-2 flex items-center justify-between">
		<div class="flex flex-wrap items-center gap-2">
			{#each activityFilters as filter (filter.type)}
				{#if filter.applied}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore event_directive_deprecated -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<ion-chip outline class="flex" on:click={() => (filter.applied = false)}>
						<ion-label>{filter.label}</ion-label>
						<ion-icon icon={closeOutline}></ion-icon>
					</ion-chip>
				{/if}
			{/each}
		</div>
		<Button icon={filterOutline} click={() => (showFilters = true)}></Button>
	</div>
{/snippet}

{#snippet activityList()}
	{#if activityItems.length === 0}
		<div class="mt-4 text-center" in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
			{$t('routes.organization.page.activity.no-activities')}
		</div>
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
{/snippet}

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover class="extended" is-open={showSelectDateCalendar} on:didDismiss={() => (showSelectDateCalendar = false)}>
	{#if showSelectDateCalendar}
		<div class="text-center">
			<Calendar apply={(value) => (selectedDate = value)} dismiss={() => (showSelectDateCalendar = false)}></Calendar>
		</div>
	{/if}
</ion-popover>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={showFilters} on:didDismiss={() => (showFilters = false)}>
	<Card title={$t('routes.organization.page.activity.filters.title')} classProp="m-0">
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each activityFilters as filter (filter.type)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore event_directive_deprecated -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<ion-chip
					color={filter.applied ? 'secondary' : 'medium'}
					outline={!filter.applied}
					class="flex"
					on:click={() => (filter.applied = !filter.applied)}
				>
					{filter.label}
				</ion-chip>
			{/each}
		</div>
	</Card>
</ion-popover>

<Modal
	open={createModalOpen}
	dismissed={() => (createModalOpen = false)}
	cancel={onCancelCreateModal}
	confirm={() => createActions.onSubmit()}
	confirmLabel={$t('routes.organization.page.activity.create-modal.button.confirm')}
>
	{#if createModalOpen}
		<Card title={$t('routes.organization.page.activity.create-modal.card.title')}>
			<form use:customForm={createForm}>
				<InputItem
					name="name"
					label={$t('routes.organization.page.activity.create-modal.card.input.name')}
					icon={documentOutline}
				/>
				<InputItem
					value={selectedLocation}
					name="location"
					label={$t('routes.organization.page.activity.create-modal.card.input.location')}
					icon={locationOutline}
					inputIcon={mapOutline}
					inputIconClick={() => (mapModalOpen = true)}
				/>
				<CustomItem
					icon={calendarClearOutline}
					iconEnd={calendarOutline}
					iconClick={() => (showSelectDateCalendar = true)}
				>
					<div class="flex flex-col">
						<ion-note color="secondary" class="ms-4 pt-2 text-xs">Date</ion-note>
						<Button
							classProp="-ms-1"
							fill="clear"
							color="dark"
							size="default"
							type="button"
							click={() => (showSelectDateCalendar = true)}
							label={format(selectedDate, 'PPP')}
						></Button>
					</div>
				</CustomItem>
			</form>
		</Card>
	{/if}
</Modal>

<Modal
	open={mapModalOpen}
	dismissed={() => (mapModalOpen = false)}
	cancel={() => {
		mapModalOpen = false;
		cachedLocation = '';
	}}
	confirmLabel={$t('routes.organization.page.activity.map-modal.button.confirm')}
	confirm={() => {
		mapModalOpen = false;
		selectedLocation = cachedLocation;
	}}
	cancelLabel={$t('routes.organization.page.activity.map-modal.button.cancel')}
>
	{#if mapModalOpen}
		<LeafletMap selected={(location) => (cachedLocation = location)} classList="-m-4"></LeafletMap>
	{/if}
</Modal>

{#key updateForm}
	<Modal
		dismissed={() => (editModalOpen = false)}
		open={editModalOpen}
		cancel={onCancelEditModal}
		confirm={() => updateActions.onSubmit()}
		confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
	>
		{#if editModalOpen}
			<Card title={$t('routes.organization.page.activity.edit-modal.card.title')}>
				<form use:customForm={updateForm}>
					<InputItem
						name="name"
						label={$t('routes.organization.page.activity.create-modal.card.input.name')}
						icon={documentOutline}
					/>
					<InputItem
						name="location"
						label={$t('routes.organization.page.activity.update-modal.card.input.location')}
						icon={locationOutline}
						inputIcon={mapOutline}
						inputIconClick={() => (mapModalOpen = true)}
						value={selectedLocation}
					/>
					<CustomItem
						icon={calendarClearOutline}
						iconEnd={calendarOutline}
						iconClick={() => (showSelectDateCalendar = true)}
					>
						<Button
							classProp="ms-[-8px]"
							fill="clear"
							color="dark"
							size="default"
							type="button"
							click={() => (showSelectDateCalendar = true)}
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
		{/if}
	</Modal>
{/key}

<style>
	ion-popover.extended {
		--width: 95%;
	}
</style>
