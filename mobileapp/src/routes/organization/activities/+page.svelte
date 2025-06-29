<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';

	import { format } from 'date-fns';
	import { loadingController } from 'ionic-svelte';
	import {
		archiveOutline,
		calendarOutline,
		closeOutline,
		codeOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOutline,
		hourglassOutline,
		locationOutline,
		timeOutline
	} from 'ionicons/icons';
	import { fade } from 'svelte/transition';

	import { goto } from '$app/navigation';

	import { type CreateActivityDto, createActivitySchema } from '$lib/api/dto/client/organization';
	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationItem from '$lib/components/widgets/ionic/LocationItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import SegmentButton from '$lib/components/widgets/ionic/SegmentButton.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { DateTimePickerType, Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, getValidationResult, showAlert } from '$lib/utility';

	enum ActivityView {
		ACTIVITIES = 'activities',
		CALENDAR = 'calendar'
	}

	enum ActivityFilterType {
		archived = 'archived',
		pending = 'pending'
	}

	type ActivityFilter = {
		applied: boolean;
		icon: string;
		label: string;
		type: ActivityFilterType;
	};

	const activityItems = $derived($organizationStore?.activities ?? []);

	const activityFilters = $state<ActivityFilter[]>([
		{
			applied: true,
			icon: hourglassOutline,
			label: $t('routes.organization.page.activity.filters.type.pending'),
			type: ActivityFilterType.pending
		},
		{
			applied: false,
			icon: archiveOutline,
			label: $t('routes.organization.page.activity.filters.type.archived'),
			type: ActivityFilterType.archived
		}
	]);

	let includeTime = $state(false);
	let isDateRange = $state(false);

	let activityView = $state(ActivityView.ACTIVITIES);

	let showFilters = $state(false);

	let createActivityModalOpen = $state(false);

	let searchActivityValue = $state('');
	let filteredActivities = $state<ActivityModel[] | undefined>();

	let createActions: FormActions<CreateActivityDto>;

	const createConfig: FormConfig<CreateActivityDto> = {
		exposedActions: (exposedActions) => (createActions = exposedActions),
		onSubmit: onCreateSubmit,
		schema: createActivitySchema()
	};

	const createForm = new Form(createActivitySchema().cast({}) as CreateActivityDto, createConfig);

	$effect(() => {
		if (activityItems) {
			filteredActivities = activityItems;
		}
	});

	function onCreateActivity(date: string): void {
		void date;
		createActivityModalOpen = true;
	}

	async function onCreateSubmit(model: CreateActivityDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await organizationResource.createActivity(organizationId, model));
				if (result.valid) {
					createActivityModalOpen = true;
					await organizationStore.update(organizationId);
				} else {
					createActions.applyValidationFeedback(result);
				}
			} else {
				await showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
		}
		createActivityModalOpen = false;
	}

	function onSearchEvents(event: CustomEvent): void {
		searchActivityValue = event.detail.value ?? '';
		filteredActivities = activityItems.filter((activity) => activity.name.toLowerCase().includes(searchActivityValue));
	}
</script>

<Layout
	title={$t('routes.organization.page.activity.title')}
	showBackButton
	scrollable={activityView === ActivityView.CALENDAR}
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
			value={ActivityView.ACTIVITIES}
		></SegmentButton>
		<SegmentButton
			icon={calendarOutline}
			label={$t('routes.organization.page.activity.segments.calendar')}
			value={ActivityView.CALENDAR}
			searchable={PageRoute.ORGANIZATION.ACTIVITIES}
		></SegmentButton>
	</ion-segment>
{/snippet}

{#snippet activitySegmentView()}
	<ion-segment-view in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
		<ion-segment-content class={activityView === ActivityView.ACTIVITIES ? 'flex h-full flex-col pb-6' : ''}>
			{#if activityView === ActivityView.ACTIVITIES}
				<FabButton
					label={$t('routes.organization.page.activity.create')}
					click={() => onCreateActivity(new Date().toISOString())}
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

				<div class="scroll-viewport">
					{@render activityList()}
				</div>
			{:else if activityView === ActivityView.CALENDAR}
				<Datetime
					apply={onCreateActivity}
					applyText={$t('routes.organization.page.activity.calendar.done')}
					dismissText=""
				></Datetime>
			{/if}
		</ion-segment-content>
	</ion-segment-view>
{/snippet}

{#snippet activityFilter()}
	<div class="mx-2 flex items-center justify-between">
		<div class="flex flex-wrap items-center gap-2">
			{#each activityFilters as filter (filter.type)}
				{#if filter.applied}
					<Chip label={filter.label} icon={filter.icon} iconEnd={closeOutline} click={() => (filter.applied = false)} />
				{/if}
			{/each}
		</div>
		<Button icon={filterOutline} click={() => (showFilters = true)}></Button>
	</div>
{/snippet}

{#snippet activityList()}
	{#if filteredActivities}
		{#if activityItems.length === 0}
			<div class="mt-4 text-center" in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				{$t('routes.organization.page.activity.no-activities')}
			</div>
		{:else if filteredActivities.length > 0}
			<ion-list in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				{#each filteredActivities as activity (activity.id)}
					{@render activityCard(activity)}
				{/each}
			</ion-list>
		{:else}
			<div class="mt-4 text-center" in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				{$t('routes.organization.page.activity.no-activities-found', { value: searchActivityValue })}
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet activityCard(activity: ActivityModel)}
	<Card color="light" click={() => goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL(activity.id))}>
		<div class="flex flex-col justify-center">
			<div class="text-lg">
				{activity.name}
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-end justify-center gap-1">
					<ion-icon icon={calendarOutline} color="medium" class="text-2xl"></ion-icon>
					<ion-text color="medium">{format(new Date(), 'PPP')}</ion-text>
				</div>
				<div class="flex items-end justify-center gap-1">
					<ion-icon icon={locationOutline} color="medium" class="text-2xl"></ion-icon>
					<ion-text color="medium" class="max-w-[60vw] truncate">{activity.location}</ion-text>
				</div>
			</div>
		</div>
	</Card>
{/snippet}

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={showFilters} on:didDismiss={() => (showFilters = false)}>
	<Card title={$t('routes.organization.page.activity.filters.title')} classList="m-0">
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each activityFilters as filter (filter.type)}
				<Chip click={() => (filter.applied = !filter.applied)} label={filter.label} selected={filter.applied} />
			{/each}
		</div>
	</Card>
</ion-popover>

<Modal
	open={createActivityModalOpen}
	confirm={() => createActions.onSubmit()}
	dismissed={() => (createActivityModalOpen = false)}
	confirmLabel={$t('routes.organization.page.activity.create-modal.button.confirm')}
>
	<Card title={$t('routes.organization.page.activity.create-modal.card.title')}>
		<form use:customForm={createForm}>
			<InputItem
				name="name"
				label={$t('routes.organization.page.activity.create-modal.card.input.name')}
				icon={documentOutline}
			/>
			<LocationItem name="location" label={$t('routes.organization.page.activity.create-modal.card.input.location')} />
			<ToggleItem
				change={() => (includeTime = !includeTime)}
				label={$t('routes.organization.page.activity.modal.create-activity.form.include-time')}
				icon={timeOutline}
				enabled={includeTime}
			/>
			<ToggleItem
				change={() => (isDateRange = !isDateRange)}
				enabled={isDateRange}
				icon={codeOutline}
				label={$t('routes.organization.page.activity.modal.create-activity.form.include-end-date')}
			/>
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.create-modal.card.input.start-date')}
				type={includeTime ? DateTimePickerType.DATETIME : DateTimePickerType.DATE}
			/>
			{#if isDateRange}
				<DatetimeInputItem
					label={$t('routes.organization.page.activity.create-modal.card.input.end-date')}
					type={includeTime ? DateTimePickerType.DATETIME : DateTimePickerType.DATE}
				/>
			{/if}
		</form>
	</Card>
</Modal>
