<script lang="ts">
	import type { ActivityCreationRequestTO, ActivityTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import {
		barbellOutline,
		calendarClearOutline,
		cardOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOutline,
		locationOutline,
		refreshOutline,
		saveOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createActivitySchema } from '$lib/api/schema/organization';
	import { activityService } from '$lib/api/services';
	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import { t } from '$lib/locales';
	import { Form, type SegmentConfig } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { customForm, hasOrganizationRole } from '$lib/utility';

	type TimeFilter = 'all' | 'future' | 'past';
	type BalanceFilter = 'all' | 'negative' | 'neutral' | 'positive';
	type HasPostingsFilter = 'all' | 'with' | 'without';

	type ActivitiesFilterDraft = {
		balanceFilter: BalanceFilter;
		fromDate: string;
		hasPostings: HasPostingsFilter;
		timeFilter: TimeFilter;
		toDate: string;
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
	let filterOpen = $state<boolean>(false);

	let searchActivityValue = $state<string>('');
	let selectedDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));

	// Filter state
	let fromFilterDate = $state<string>('');
	let toFilterDate = $state<string>('');
	let timeFilter = $state<TimeFilter>('all');
	let hasPostingsFilter = $state<HasPostingsFilter>('all');
	let balanceFilter = $state<BalanceFilter>('all');
	let hasNonSearchFiltersApplied = $state<boolean>(false);

	let filterDraft = $state<ActivitiesFilterDraft>({
		balanceFilter: 'all',
		fromDate: '',
		hasPostings: 'all',
		timeFilter: 'all',
		toDate: ''
	});

	const activitiesForSelectedDate = $derived(activityItems.filter((activity) => activity.date === selectedDate));

	let initialized = $state<boolean>(false);

	$effect(() => {
		if (activityItems.length > 0 && !initialized) {
			const minDate = getMinActivityDate();
			const maxDate = getMaxActivityDate();
			fromFilterDate = minDate;
			toFilterDate = maxDate;
			filterDraft = {
				...filterDraft,
				fromDate: minDate,
				toDate: maxDate
			};
			initialized = true;
		}
	});

	const form = new Form({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			createActivityModalOpen = false;
			actions.setModel(createActivitySchema().getDefault());
		},
		request: async (model: ActivityCreationRequestTO) => activityService.create($organizationStore?.id!, model),
		schema: createActivitySchema()
	});

	const filteredActivities = $derived(
		filterActivities(
			activityItems,
			searchActivityValue,
			timeFilter,
			fromFilterDate,
			toFilterDate,
			hasPostingsFilter,
			balanceFilter
		)
	);

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

	function syncDraftFilters(): void {
		filterDraft = {
			balanceFilter: balanceFilter,
			fromDate: fromFilterDate,
			hasPostings: hasPostingsFilter,
			timeFilter: timeFilter,
			toDate: toFilterDate
		};
	}

	function updateHasNonSearchFiltersApplied(): void {
		const minDate = getMinActivityDate();
		const maxDate = getMaxActivityDate();
		hasNonSearchFiltersApplied =
			timeFilter !== 'all' ||
			fromFilterDate !== minDate ||
			toFilterDate !== maxDate ||
			hasPostingsFilter !== 'all' ||
			balanceFilter !== 'all';
	}

	function applyDraftFilter(): void {
		fromFilterDate = filterDraft.fromDate;
		toFilterDate = filterDraft.toDate;
		timeFilter = filterDraft.timeFilter;
		hasPostingsFilter = filterDraft.hasPostings;
		balanceFilter = filterDraft.balanceFilter;
		filterOpen = false;
		syncDraftFilters();
		updateHasNonSearchFiltersApplied();
	}

	function resetDraftFilter(): void {
		filterDraft = {
			balanceFilter: 'all',
			fromDate: getMinActivityDate(),
			hasPostings: 'all',
			timeFilter: 'all',
			toDate: getMaxActivityDate()
		};
		applyDraftFilter();
	}

	function onFilterModalDismiss(): void {
		filterOpen = false;
		syncDraftFilters();
	}

	function onCreateActivity(date: string): void {
		selectedDate = date;
		createActivityModalOpen = true;
	}

	function onDateSelected(date: string): void {
		selectedDate = date;
	}

	function onSearchEvents(event: CustomEvent): void {
		searchActivityValue = event.detail.value ?? '';
	}

	function setDraftTimeFilter(value: TimeFilter): void {
		filterDraft = { ...filterDraft, timeFilter: value };
	}

	function setDraftBalanceFilter(value: BalanceFilter): void {
		filterDraft = { ...filterDraft, balanceFilter: value };
	}

	function setDraftHasPostings(value: HasPostingsFilter): void {
		filterDraft = { ...filterDraft, hasPostings: value };
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
			indexLabel={$t('routes.organization.activities.page.activities.fab.create')}
			clicked={() => onCreateActivity(format(new TZDate(), 'yyyy-MM-dd'))}
			icon={createOutline}
			indexed="/organization/activities"
		/>
	{/if}

	<div class="flex items-center justify-between gap-2">
		<ion-searchbar
			class="flex-1"
			color="light"
			show-clear-button="always"
			debounce={100}
			placeholder={$t('routes.organization.activities.page.activities.search.placeholder')}
			onionInput={onSearchEvents}
			value={searchActivityValue}
		></ion-searchbar>
		<Button fill="solid" color="secondary" clicked={() => (filterOpen = true)} icon={filterOutline} />
	</div>
	{#if hasNonSearchFiltersApplied}
		<div class="flex justify-center">
			<Button
				size="small"
				fill="outline"
				color="danger"
				icon={refreshOutline}
				label={$t('routes.organization.activities.page.activities.reset-filters')}
				clicked={resetDraftFilter}
			/>
		</div>
	{/if}
	<div class="scroll-viewport">
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
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={calendarClearOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="text-xs">{format(activity.date, 'PPP')}</ion-text>
				</div>
				<div class="flex items-center justify-center gap-1">
					<ion-icon icon={locationOutline} color="medium"></ion-icon>
					<ion-text color="medium" class="max-w-[60vw] truncate text-xs">{activity.location}</ion-text>
				</div>
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
				{$t('routes.organization.activities.page.calendar.no-events', {
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

<!-- Activities Filter Popover -->
<Popover extended open={filterOpen} dismissed={onFilterModalDismiss} lazy>
	<Card title={$t('routes.organization.activities.page.modal.filter.card.title')} classList="m-0">
		<div class="mb-3">
			<ion-text color="medium" class="text-sm">
				{$t('routes.organization.activities.page.modal.filter.card.time-filter.label')}
			</ion-text>
			<div class="mt-1 flex items-center justify-center gap-2">
				<Chip
					clicked={() => setDraftTimeFilter('all')}
					selected={filterDraft.timeFilter === 'all'}
					label={$t('routes.organization.activities.page.modal.filter.card.time-filter.all')}
				/>
				<Chip
					clicked={() => setDraftTimeFilter('past')}
					selected={filterDraft.timeFilter === 'past'}
					label={$t('routes.organization.activities.page.modal.filter.card.time-filter.past')}
				/>
				<Chip
					clicked={() => setDraftTimeFilter('future')}
					selected={filterDraft.timeFilter === 'future'}
					label={$t('routes.organization.activities.page.modal.filter.card.time-filter.future')}
				/>
			</div>
		</div>

		<DatetimeInputItem
			max={filterDraft.toDate || getMaxActivityDate()}
			min={getMinActivityDate()}
			label={$t('routes.organization.activities.page.modal.filter.card.date.from')}
			value={filterDraft.fromDate}
			changed={(value) => (filterDraft = { ...filterDraft, fromDate: value })}
		/>
		<DatetimeInputItem
			min={filterDraft.fromDate || getMinActivityDate()}
			max={getMaxActivityDate()}
			label={$t('routes.organization.activities.page.modal.filter.card.date.to')}
			value={filterDraft.toDate}
			changed={(value) => (filterDraft = { ...filterDraft, toDate: value })}
		/>

		<div class="my-3">
			<ion-text color="medium" class="text-sm">
				{$t('routes.organization.activities.page.modal.filter.card.has-postings.label')}
			</ion-text>
			<div class="mt-1 flex items-center justify-center gap-2">
				<Chip
					clicked={() => setDraftHasPostings('all')}
					selected={filterDraft.hasPostings === 'all'}
					label={$t('routes.organization.activities.page.modal.filter.card.has-postings.all')}
				/>
				<Chip
					clicked={() => setDraftHasPostings('with')}
					selected={filterDraft.hasPostings === 'with'}
					label={$t('routes.organization.activities.page.modal.filter.card.has-postings.with')}
				/>
				<Chip
					clicked={() => setDraftHasPostings('without')}
					selected={filterDraft.hasPostings === 'without'}
					label={$t('routes.organization.activities.page.modal.filter.card.has-postings.without')}
				/>
			</div>
		</div>

		<div class="mb-3">
			<ion-text color="medium" class="text-sm">
				{$t('routes.organization.activities.page.modal.filter.card.balance.label')}
			</ion-text>
			<div class="mt-1 flex flex-wrap items-center justify-center gap-2">
				<Chip
					clicked={() => setDraftBalanceFilter('all')}
					selected={filterDraft.balanceFilter === 'all'}
					label={$t('routes.organization.activities.page.modal.filter.card.balance.all')}
				/>
				<Chip
					clicked={() => setDraftBalanceFilter('positive')}
					selected={filterDraft.balanceFilter === 'positive'}
					color="success"
					icon={trendingUpOutline}
					label={$t('routes.organization.activities.page.modal.filter.card.balance.positive')}
				/>
				<Chip
					clicked={() => setDraftBalanceFilter('negative')}
					selected={filterDraft.balanceFilter === 'negative'}
					color="danger"
					icon={trendingDownOutline}
					label={$t('routes.organization.activities.page.modal.filter.card.balance.negative')}
				/>
				<Chip
					color="tertiary"
					icon={barbellOutline}
					clicked={() => setDraftBalanceFilter('neutral')}
					selected={filterDraft.balanceFilter === 'neutral'}
					label={$t('routes.organization.activities.page.modal.filter.card.balance.neutral')}
				/>
			</div>
		</div>

		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				label={$t('routes.organization.activities.page.modal.filter.card.reset')}
				color="danger"
				icon={refreshOutline}
				fill="outline"
				clicked={resetDraftFilter}
			/>
			<Button
				label={$t('routes.organization.activities.page.modal.filter.card.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={applyDraftFilter}
			/>
		</div>
	</Card>
</Popover>
