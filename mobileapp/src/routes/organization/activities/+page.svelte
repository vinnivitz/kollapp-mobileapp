<script lang="ts">
	import type { ActivityTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import {
		barbellOutline,
		calendarClearOutline,
		cardOutline,
		createOutline,
		documentOutline,
		flashOutline,
		locationOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createActivitySchema } from '$lib/api/schema/organization';
	import { activityService } from '$lib/api/services';
	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import Filter from '$lib/components/widgets/PostingFilter.svelte';
	import { t } from '$lib/locales';
	import {
		chipSection,
		dateRangeSection,
		type FilterConfig,
		Form,
		type SegmentConfig,
		TourStepId
	} from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, hasOrganizationRole } from '$lib/utility';

	type TimeFilter = 'all' | 'future' | 'past';
	type BalanceFilter = 'all' | 'negative' | 'neutral' | 'positive';
	type HasPostingsFilter = 'all' | 'with' | 'without';

	type ActivitiesFilterState = {
		balanceFilter: BalanceFilter;
		dateRange: { from: string; to: string };
		hasPostings: HasPostingsFilter;
		timeFilter: TimeFilter;
	};

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
	const activityDates = $derived(activityItems.map((activity) => activity.date));

	let createActivityModalOpen = $state<boolean>(false);

	let searchActivityValue = $state<string>('');
	let selectedDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));

	// Filter state
	let filterState = $state<ActivitiesFilterState>({
		balanceFilter: 'all',
		dateRange: { from: '', to: '' },
		hasPostings: 'all',
		timeFilter: 'all'
	});

	const activitiesForSelectedDate = $derived(activityItems.filter((activity) => activity.date === selectedDate));

	let initialized = $state<boolean>(false);

	$effect(() => {
		if (activityItems.length > 0 && !initialized) {
			const minDate = getMinActivityDate();
			const maxDate = getMaxActivityDate();
			filterState = {
				...filterState,
				dateRange: { from: minDate, to: maxDate }
			};
			initialized = true;
		}
	});

	const form = new Form({
		completed: async ({ actions }) => {
			await organizationStore.update();
			createActivityModalOpen = false;
			actions.setModel(createActivitySchema().getDefault());
		},
		request: activityService.create,
		schema: createActivitySchema()
	});

	const filteredActivities = $derived(
		filterActivities(
			activityItems,
			searchActivityValue,
			filterState.timeFilter,
			filterState.dateRange.from,
			filterState.dateRange.to,
			filterState.hasPostings,
			filterState.balanceFilter
		)
	);

	const filterConfig = $derived<FilterConfig<ActivitiesFilterState>>({
		onApply: (state) => (filterState = state),
		searchbar: {
			onSearch: (value) => (searchActivityValue = value),
			placeholder: $t('routes.organization.activities.page.activities.search.placeholder'),
			value: searchActivityValue
		},
		sections: [
			chipSection<TimeFilter>('timeFilter', {
				defaultValue: 'all',
				label: $t('routes.organization.activities.page.modal.filter.card.time-filter.label'),
				options: [
					{
						label: $t('routes.organization.activities.page.modal.filter.card.time-filter.all'),
						value: 'all'
					},
					{
						label: $t('routes.organization.activities.page.modal.filter.card.time-filter.past'),
						value: 'past'
					},
					{
						label: $t('routes.organization.activities.page.modal.filter.card.time-filter.future'),
						value: 'future'
					}
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinActivityDate(),
				defaultToValue: getMaxActivityDate(),
				label: $t('routes.organization.activities.page.modal.filter.card.date-range.label'),
				max: getMaxActivityDate(),
				min: getMinActivityDate()
			}),
			chipSection<HasPostingsFilter>('hasPostings', {
				defaultValue: 'all',
				label: $t('routes.organization.activities.page.modal.filter.card.has-postings.label'),
				options: [
					{
						label: $t('routes.organization.activities.page.modal.filter.card.has-postings.all'),
						value: 'all'
					},
					{
						label: $t('routes.organization.activities.page.modal.filter.card.has-postings.with'),
						value: 'with'
					},
					{
						label: $t('routes.organization.activities.page.modal.filter.card.has-postings.without'),
						value: 'without'
					}
				]
			}),
			chipSection<BalanceFilter>('balanceFilter', {
				defaultValue: 'all',
				label: $t('routes.organization.activities.page.modal.filter.card.balance.label'),
				options: [
					{
						label: $t('routes.organization.activities.page.modal.filter.card.balance.all'),
						value: 'all'
					},
					{
						color: 'success',
						icon: trendingUpOutline,
						label: $t('routes.organization.activities.page.modal.filter.card.balance.positive'),
						value: 'positive'
					},
					{
						color: 'danger',
						icon: trendingDownOutline,
						label: $t('routes.organization.activities.page.modal.filter.card.balance.negative'),
						value: 'negative'
					},
					{
						color: 'tertiary',
						icon: barbellOutline,
						label: $t('routes.organization.activities.page.modal.filter.card.balance.neutral'),
						value: 'neutral'
					}
				]
			})
		],
		state: filterState,
		title: $t('routes.organization.activities.page.modal.filter.card.title')
	});

	function filterActivities(
		activities: ActivityTO[],
		search: string,
		time: TimeFilter,
		fromDate: string,
		toDate: string,
		hasPostings: HasPostingsFilter,
		balance: BalanceFilter
	): ActivityTO[] {
		const searchTerm = search.trim().toLowerCase();
		const today = format(new TZDate(), 'yyyy-MM-dd');

		return activities.filter((activity) => {
			return (
				matchesSearch(activity, searchTerm) &&
				matchesTimeFilter(activity, time, today) &&
				matchesDateRange(activity, fromDate, toDate) &&
				matchesPostingsFilter(activity, hasPostings) &&
				matchesBalanceFilter(activity, balance)
			);
		});
	}

	function matchesSearch(activity: ActivityTO, searchTerm: string): boolean {
		return searchTerm === '' || activity.name.toLowerCase().includes(searchTerm);
	}

	function matchesTimeFilter(activity: ActivityTO, time: TimeFilter, today: string): boolean {
		if (time === 'past') return activity.date < today;
		if (time === 'future') return activity.date >= today;
		return true;
	}

	function matchesDateRange(activity: ActivityTO, fromDate: string, toDate: string): boolean {
		if (fromDate && activity.date < fromDate) return false;
		if (toDate && activity.date > toDate) return false;
		return true;
	}

	function matchesPostingsFilter(activity: ActivityTO, hasPostings: HasPostingsFilter): boolean {
		const postingsCount = activity.activityPostings?.length ?? 0;
		if (hasPostings === 'with') return postingsCount > 0;
		if (hasPostings === 'without') return postingsCount === 0;
		return true;
	}

	function matchesBalanceFilter(activity: ActivityTO, balance: BalanceFilter): boolean {
		if (balance === 'all') return true;
		const activityBalance = calculateActivityBalance(activity);
		if (balance === 'positive') return activityBalance > 0;
		if (balance === 'negative') return activityBalance < 0;
		return activityBalance === 0;
	}

	function calculateActivityBalance(activity: ActivityTO): number {
		let balance = 0;
		for (const posting of activity.activityPostings ?? []) {
			if (posting.type === 'CREDIT') balance += posting.amountInCents;
			else if (posting.type === 'DEBIT') balance -= posting.amountInCents;
		}
		return balance;
	}

	function getMinActivityDate(): string {
		if (activityItems.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let min = activityItems[0]!.date;
		for (const activity of activityItems) {
			if (activity.date < min) min = activity.date;
		}
		return min;
	}

	function getMaxActivityDate(): string {
		if (activityItems.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let max = activityItems[0]!.date;
		for (const activity of activityItems) {
			if (activity.date > max) max = activity.date;
		}
		return max;
	}

	function onCreateActivity(date: string): void {
		selectedDate = date;
		createActivityModalOpen = true;
	}

	function onDateSelected(date: string): void {
		selectedDate = date;
	}
</script>

<Layout
	title={$t('routes.organization.activities.page.title')}
	showBackButton
	scrollable={activityView === ActivityView.CALENDAR}
>
	<SegmentItem tourId={TourStepId.ACTIVITIES.SEGMENTS} config={segmentConfig}>
		<div class={activityView === ActivityView.ACTIVITIES ? 'flex h-full flex-col pb-6' : ''}>
			{#if activityView === ActivityView.ACTIVITIES}
				{@render activitiesView()}
			{:else if activityView === ActivityView.CALENDAR}
				<div class="flex flex-col gap-4 pb-6">
					<Datetime dates={activityDates} value={selectedDate} applied={onDateSelected} showButtons={false} />
					{@render calendarActivityList()}
				</div>
			{/if}
		</div>
	</SegmentItem>
</Layout>

<!-- Snippets -->

{#snippet activitiesView()}
	{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
		<FabButton
			accessible="ROLE_ORGANIZATION_MANAGER"
			tourId={TourStepId.ACTIVITIES.CREATE}
			indexLabel={$t('routes.organization.activities.page.activities.fab.create')}
			clicked={() => onCreateActivity(format(new TZDate(), 'yyyy-MM-dd'))}
			icon={createOutline}
			indexed="/organization/activities"
		/>
	{/if}

	<Filter config={filterConfig} />
	<div class="scroll-viewport" data-tour={TourStepId.ACTIVITIES.LIST}>
		{@render activityList()}
	</div>
{/snippet}

{#snippet activityList()}
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
			<ion-note>
				{#if searchActivityValue === ''}
					{$t('routes.organization.activities.page.activities.no-results-filtered')}
				{:else}
					{$t('routes.organization.activities.page.activities.no-results', { value: searchActivityValue })}
				{/if}
			</ion-note>
		</FadeInOut>
	{/if}
{/snippet}

{#snippet activityCard(activity: ActivityTO)}
	<Card
		color="light"
		clicked={() => goto(resolve(`/organization/activities/[slug]`, { slug: activity.id.toString() }))}
	>
		<div class="flex flex-col justify-center">
			<ion-text class="truncate">{activity.name}</ion-text>
			<div class="flex flex-row items-center gap-3">
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={calendarClearOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="text-xs">{format(activity.date, 'PPP')}</ion-text>
				</div>
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={locationOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="max-w-[60vw] truncate text-xs">{activity.location}</ion-text>
				</div>
			</div>
			<div class="mt-1 flex flex-row items-center gap-3">
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={cardOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="max-w-[60vw] truncate text-xs">{activity.activityPostings.length}</ion-text>
				</div>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet calendarActivityList()}
	{#if activitiesForSelectedDate.length > 0}
		<FadeInOut>
			<ion-list>
				{#each activitiesForSelectedDate as activity (activity.id)}
					{@render activityCard(activity)}
				{/each}
			</ion-list>
		</FadeInOut>
	{:else}
		<FadeInOut classList="mt-4 text-center">
			<ion-note>
				{$t('routes.organization.activities.page.calendar.no-activities', {
					value: format(selectedDate, 'PPP')
				})}
			</ion-note>
		</FadeInOut>
	{/if}
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
			<DatetimeInputItem
				name="date"
				label={$t('routes.organization.activities.page.modal.create-activity.card.form.date')}
			/>
		</form>
	</Card>
</Modal>
