<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';
	import type { ActivityCreationRequestTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import {
		archiveOutline,
		calendarOutline,
		closeOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOutline,
		hourglassOutline,
		locationOutline
	} from 'ionicons/icons';
	import { fade } from 'svelte/transition';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { activityService } from '$lib/api/services';
	import { createActivitySchema } from '$lib/api/validation/organization';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type SegmentConfig } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, hasOrganizationRole } from '$lib/utility';

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

	let activityView = $state<ActivityView>(ActivityView.ACTIVITIES);

	const segmentConfig = $derived<SegmentConfig[]>([
		{
			class: 'flex h-full flex-col pb-6',
			clicked: () => (activityView = ActivityView.ACTIVITIES),
			icon: flashOutline,
			label: $t('routes.organization.page.activity.segments.activities'),
			selected: activityView === ActivityView.ACTIVITIES
		},
		{
			clicked: () => (activityView = ActivityView.CALENDAR),
			icon: calendarOutline,
			indexed: '/organization/activities',
			label: $t('routes.organization.page.activity.segments.calendar'),
			selected: activityView === ActivityView.CALENDAR
		}
	]);

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

	let showFilters = $state(false);

	let createActivityModalOpen = $state(false);

	let searchActivityValue = $state('');
	let filteredActivities = $state<ActivityModel[]>();

	const form = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createActivityModalOpen = false;
		},
		request: async (model: ActivityCreationRequestTO) => activityService.create($organizationStore?.id!, model),
		schema: createActivitySchema()
	});

	$effect(() => {
		if (activityItems) filteredActivities = activityItems;
	});

	function onCreateActivity(date: string): void {
		void date;
		createActivityModalOpen = true;
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
	<SegmentItem config={segmentConfig}>
		<div class={activityView === ActivityView.ACTIVITIES ? 'flex h-full flex-col pb-6' : ''}>
			{#if activityView === ActivityView.ACTIVITIES}
				{@render activitiesView()}
			{:else if activityView === ActivityView.CALENDAR}
				<Datetime
					applied={onCreateActivity}
					applyText={$t('routes.organization.page.activity.calendar.done')}
					dismissText=""
				></Datetime>
			{/if}
		</div>
	</SegmentItem>
</Layout>

<!-- Snippets -->

{#snippet activitiesView()}
	{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
		<FabButton
			label={$t('routes.organization.page.activity.create')}
			clicked={() => onCreateActivity(format(new TZDate(), 'yyyy-MM-dd'))}
			icon={createOutline}
			indexed="/organization/activities"
		/>
	{/if}

	<div class="flex items-center justify-between gap-2">
		<ion-searchbar
			color="light"
			show-clear-button="always"
			debounce={100}
			placeholder={$t('routes.organization.page.activity.search.placeholder')}
			onionInput={onSearchEvents}
			value={searchActivityValue}
		></ion-searchbar>
		<Button icon={filterOutline} clicked={() => (showFilters = true)} />
	</div>
	{@render activityFilter()}

	<div class="scroll-viewport">
		{@render activityList()}
	</div>
{/snippet}

{#snippet activityFilter()}
	<div class="flex flex-wrap items-center gap-2">
		{#each activityFilters as filter (filter.type)}
			{#if filter.applied}
				<Chip label={filter.label} icon={filter.icon} iconEnd={closeOutline} clicked={() => (filter.applied = false)} />
			{/if}
		{/each}
	</div>
{/snippet}

{#snippet activityList()}
	{#if filteredActivities}
		{#if activityItems.length === 0}
			<div class="mt-4 text-center" in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
				<ion-note>{$t('routes.organization.page.activity.no-activities')}</ion-note>
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
	<Card
		color="light"
		clicked={() => goto(resolve(`/organization/activities/[slug]`, { slug: activity.id.toString() }))}
	>
		<div class="flex flex-col justify-center">
			<ion-text class="truncate">{activity.name}</ion-text>
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={calendarOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="text-xs">{format(new TZDate(), 'PPP')}</ion-text>
				</div>
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={locationOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="max-w-[60vw] truncate text-xs">{activity.location}</ion-text>
				</div>
			</div>
		</div>
	</Card>
{/snippet}

<!-- Modals -->

<!-- Filters -->
<Popover open={showFilters} dismissed={() => (showFilters = false)} lazy>
	<Card title={$t('routes.organization.page.activity.filters.title')} classList="m-0">
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each activityFilters as filter (filter.type)}
				<Chip clicked={() => (filter.applied = !filter.applied)} label={filter.label} selected={filter.applied} />
			{/each}
		</div>
	</Card>
</Popover>

<!-- Create Activity -->
<Modal
	open={createActivityModalOpen}
	dismissed={() => (createActivityModalOpen = false)}
	confirmLabel={$t('routes.organization.page.activity.create-modal.button.confirm')}
>
	{#if createActivityModalOpen}
		<Card title={$t('routes.organization.page.activity.create-modal.card.title')}>
			<form use:customForm={form}>
				<TextInputItem
					name="name"
					label={$t('routes.organization.page.activity.create-modal.card.input.name')}
					icon={documentOutline}
				/>
				<LocationInputItem
					name="location"
					label={$t('routes.organization.page.activity.create-modal.card.input.location')}
				/>
			</form>
		</Card>
	{/if}
</Modal>
