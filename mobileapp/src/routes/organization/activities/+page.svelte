<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';
	import type { ActivityCreationRequestTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import { calendarClearOutline, createOutline, documentOutline, flashOutline, locationOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { activityService } from '$lib/api/services';
	import { createActivitySchema } from '$lib/api/validation/organization';
	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type SegmentConfig } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, hasOrganizationRole } from '$lib/utility';

	enum ActivityView {
		ACTIVITIES = 'activities',
		CALENDAR = 'calendar'
	}

	let activityView = $state<ActivityView>(ActivityView.ACTIVITIES);

	const segmentConfig = $derived<SegmentConfig[]>([
		{
			class: 'flex h-full flex-col pb-6',
			clicked: () => (activityView = ActivityView.ACTIVITIES),
			icon: flashOutline,
			label: $t('routes.organization.activities.page.segments.activities'),
			selected: activityView === ActivityView.ACTIVITIES
		},
		{
			clicked: () => (activityView = ActivityView.CALENDAR),
			icon: calendarClearOutline,
			indexed: '/organization/activities',
			label: $t('routes.organization.activities.page.segments.calendar'),
			selected: activityView === ActivityView.CALENDAR
		}
	]);

	const activityItems = $derived($organizationStore?.activities ?? []);

	let createActivityModalOpen = $state<boolean>(false);

	let searchActivityValue = $state<string>('');
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
	title={$t('routes.organization.activities.page.title')}
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
					applyText={$t('routes.organization.activities.page.calendar.apply')}
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
			indexedLabel={$t('routes.organization.activities.page.activities.fab.create')}
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
			placeholder={$t('routes.organization.activities.page.activities.search.placeholder')}
			onionInput={onSearchEvents}
			value={searchActivityValue}
		></ion-searchbar>
	</div>
	<div class="scroll-viewport">
		{@render activityList()}
	</div>
{/snippet}

{#snippet activityList()}
	{#if filteredActivities}
		{#if activityItems.length === 0}
			<FadeInOut classList="mt-4 text-center">
				<ion-note>{$t('routes.organization.activities.page.activities.not-found')}</ion-note>
			</FadeInOut>
		{:else if filteredActivities.length > 0}
			<FadeInOut>
				<ion-list>
					{#each filteredActivities as activity (activity.id)}
						{@render activityCard(activity)}
					{/each}
				</ion-list>
			</FadeInOut>
		{:else}
			<FadeInOut classList="mt-4 text-center">
				{$t('routes.organization.activities.page.activities.no-results', { value: searchActivityValue })}
			</FadeInOut>
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
					<ion-icon icon={calendarClearOutline} color="medium"></ion-icon>
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

<!-- Create Activity -->
<Modal
	open={createActivityModalOpen}
	dismissed={() => (createActivityModalOpen = false)}
	confirmLabel={$t('routes.organization.activities.page.modal.create-activity.confirm')}
>
	<Card title={$t('routes.organization.activities.page.modal.create-activity.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="name"
				label={$t('routes.organization.activities.page.modal.create-activity.card.form.name')}
				icon={documentOutline}
			/>
			<LocationInputItem
				name="location"
				label={$t('routes.organization.activities.page.modal.create-activity.card.form.location')}
			/>
		</form>
	</Card>
</Modal>
