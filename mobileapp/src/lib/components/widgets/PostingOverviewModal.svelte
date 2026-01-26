<script lang="ts">
	import type { ResponseBody } from '$lib/models/api';
	import type { FilterConfig, MultiSelectItem } from '$lib/models/ui';
	import type {
		ActivityTO,
		OrganizationBudgetCategoryResponseTO,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import {
		albumsOutline,
		cardOutline,
		flashOffOutline,
		peopleOutline,
		personRemoveOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import Modal from './ionic/Modal.svelte';
	import PostingFilter from './PostingFilter.svelte';
	import PostingItem from './PostingItem.svelte';

	import { t } from '$lib/locales';
	import { chipMultiSection, dateRangeSection, multiSelectSection } from '$lib/models/ui';
	import { getBudgetCategoryNameById, getUsernameByPersonOfOrganizationId } from '$lib/utility';

	type PostingsFilterState = {
		activityIds: number[];
		budgetCategoryIds: number[];
		dateRange: { from: string; to: string };
		personOfOrganizationIds: number[];
		postingTypes: PostingType[];
	};

	type Properties = {
		activities: ActivityTO[];
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		personsOfOrganization: PersonOfOrganizationTO[];
		postings: PostingTO[];
		open?: boolean;
		showActivityFilter?: boolean;
		showPersonOfOrganizationFilter?: boolean;
		dismissed: () => void;
		onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
		onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
		onTransferActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody<PostingTO>>;
		onTransferOrganizationPosting: (postingId: number) => Promise<ResponseBody<PostingTO>>;
		onUpdateActivityPosting: (
			activityId: number,
			postingId: number,
			model: PostingCreateUpdateRequestTO
		) => Promise<ResponseBody<PostingTO>>;
		onUpdateOrganizationPosting: (
			postingId: number,
			model: PostingCreateUpdateRequestTO
		) => Promise<ResponseBody<PostingTO>>;
		onCompleted?: () => Promise<void>;
	};

	let {
		activities,
		budgetCategories,
		dismissed,
		onCompleted,
		onDeleteActivityPosting,
		onDeleteOrganizationPosting,
		onTransferActivityPosting,
		onTransferOrganizationPosting,
		onUpdateActivityPosting,
		onUpdateOrganizationPosting,
		open = false,
		personsOfOrganization,
		postings,
		showActivityFilter = true,
		showPersonOfOrganizationFilter = true
	}: Properties = $props();

	const PAGE_SIZE = 10;

	let displayCount = $state<number>(0);
	let isLoading = $state<boolean>(true);
	let searchValue = $state<string>('');
	let filterState = $state<PostingsFilterState>();
	let isEditing = $state<boolean>(false);
	let stablePostings = $state<PostingTO[]>([]);

	$effect(() => {
		if (!isEditing) {
			stablePostings = [...postings];
		}
	});

	const budgetCategoryFilterItems = $derived<MultiSelectItem[]>(
		budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: true
		}))
	);

	const personOfOrganizationFilterItems = $derived<MultiSelectItem[]>([
		...personsOfOrganization.map((personOfOrganization) => ({
			data: { id: personOfOrganization.id, label: personOfOrganization.username },
			selected: true
		})),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('components.posting-overview.filter.person-of-organization.unassigned') },
			icon: personRemoveOutline,
			selected: true
		}
	]);

	const activityFilterItems = $derived<MultiSelectItem[]>([
		...activities.map((activity) => ({
			data: { id: activity.id, label: activity.name },
			selected: true
		})),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('components.posting-overview.filter.activities.unassigned') },
			icon: flashOffOutline,
			selected: true
		}
	]);

	const filterConfig = $derived<FilterConfig<PostingsFilterState>>({
		onApply: (state) => (filterState = state),
		searchbar: {
			onSearch: (value) => (searchValue = value),
			placeholder: $t('components.posting-overview.search.placeholder'),
			value: searchValue
		},
		sections: [
			chipMultiSection<PostingType>('postingTypes', {
				defaultValue: ['DEBIT', 'CREDIT'],
				label: $t('components.posting-overview.filter.posting-types'),
				options: [
					{
						color: 'success',
						icon: trendingUpOutline,
						label: $t('components.posting-overview.filter.credit'),
						value: 'CREDIT'
					},
					{
						color: 'danger',
						icon: trendingDownOutline,
						label: $t('components.posting-overview.filter.debit'),
						value: 'DEBIT'
					}
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinPostingDate(),
				defaultToValue: getMaxPostingDate(),
				label: $t('components.posting-overview.filter.date-range')
			}),
			...(showPersonOfOrganizationFilter
				? [
						multiSelectSection('personOfOrganizationIds', {
							allSelectedText: $t('components.posting-overview.filter.person.all-selected'),
							icon: peopleOutline,
							inputLabel: $t('components.posting-overview.filter.person.select'),
							items: personOfOrganizationFilterItems,
							label: $t('components.posting-overview.filter.person.label'),
							searchPlaceholder: $t('components.posting-overview.filter.person.search')
						})
					]
				: []),
			multiSelectSection('budgetCategoryIds', {
				allSelectedText: $t('components.posting-overview.filter.budget-category.all-selected'),
				icon: cardOutline,
				inputLabel: $t('components.posting-overview.filter.budget-category.select'),
				items: budgetCategoryFilterItems,
				label: $t('components.posting-overview.filter.budget-category.label'),
				searchPlaceholder: $t('components.posting-overview.filter.budget-category.search')
			}),
			...(showActivityFilter && activities.length > 0
				? [
						multiSelectSection('activityIds', {
							allSelectedText: $t('components.posting-overview.filter.activities.all-selected'),
							icon: albumsOutline,
							inputLabel: $t('components.posting-overview.filter.activities.select'),
							items: activityFilterItems,
							label: $t('components.posting-overview.filter.activities.label'),
							searchPlaceholder: $t('components.posting-overview.filter.activities.search')
						})
					]
				: [])
		],
		state: filterState,
		title: $t('components.posting-overview.filter.title')
	});

	const activityPostingIdMap = $derived.by(() => {
		const map = new SvelteMap<number, ActivityTO>();
		for (const activity of activities) {
			for (const activityPosting of activity.activityPostings) {
				map.set(activityPosting.id, activity);
			}
		}
		return map;
	});

	const organizationPostingIds = $derived(
		new Set(stablePostings.filter((posting) => !activityPostingIdMap.has(posting.id)).map((posting) => posting.id))
	);

	const filteredPostings = $derived.by(() => {
		if (!filterState) return stablePostings;

		const fromTime = new TZDate(filterState.dateRange.from).getTime();
		const toTime = new TZDate(filterState.dateRange.to).getTime();
		const allowedPostingTypes = new Set(filterState.postingTypes);
		const allowedActivityIds = new Set(filterState.activityIds);
		const allowedBudgetCategoryIds = new Set(filterState.budgetCategoryIds);
		const allowedPersonOfOrganizationIds = new Set(filterState.personOfOrganizationIds);
		const search = searchValue.trim().toLowerCase();

		return stablePostings.filter((posting) => {
			if (!allowedPostingTypes.has(posting.type)) return false;

			const postingTime = new TZDate(posting.date).getTime();
			if (postingTime < fromTime || postingTime > toTime) return false;

			if (!allowedBudgetCategoryIds.has(posting.organizationBudgetCategoryId)) return false;

			if (showPersonOfOrganizationFilter && !allowedPersonOfOrganizationIds.has(posting.personOfOrganizationId)) {
				return false;
			}

			if (showActivityFilter) {
				const isOrganizationPosting = organizationPostingIds.has(posting.id);
				const postingActivity = activityPostingIdMap.get(posting.id);
				const matchesActivities =
					isOrganizationPosting || (!!postingActivity && allowedActivityIds.has(postingActivity.id));
				if (!matchesActivities) return false;
			}

			if (search === '') return true;

			const matchesPurpose = posting.purpose.toLowerCase().includes(search);
			const matchesCategoryName = getBudgetCategoryNameById(posting.organizationBudgetCategoryId)
				.toLowerCase()
				.includes(search);
			const matchesUsername = !!getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)
				?.toLowerCase()
				.includes(search);
			const postingActivity = activityPostingIdMap.get(posting.id);
			const matchesActivity = postingActivity?.name.toLowerCase().includes(search);
			return matchesPurpose || matchesCategoryName || matchesUsername || matchesActivity;
		});
	});

	const displayedPostings = $derived(filteredPostings.slice(0, displayCount));

	const hasMorePostings = $derived(displayCount < filteredPostings.length);

	$effect(() => {
		if (!open) {
			isLoading = true;
			displayCount = 0;
		}
	});

	$effect(() => {
		if (open && isLoading) {
			filterState = undefined;
			searchValue = '';
		}
	});

	function getMinPostingDate(): string {
		return stablePostings.length > 0
			? new TZDate(Math.min(...stablePostings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function getMaxPostingDate(): string {
		return stablePostings.length > 0
			? new TZDate(Math.max(...stablePostings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function onModalPresented(): void {
		displayCount = PAGE_SIZE;
		isLoading = false;
	}

	function onLoadMore(event: CustomEvent): void {
		displayCount += PAGE_SIZE;
		(event.target as HTMLIonInfiniteScrollElement).complete();
	}
</script>

<Modal {open} initialBreakPoint={0.75} {dismissed} presented={onModalPresented} informational lazy>
	<div class="relative">
		<div class="sticky top-0 left-0 z-10 mb-3 flex flex-col">
			<PostingFilter config={filterConfig} />
		</div>
		{#if isLoading}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-spinner name="circular"></ion-spinner>
			</div>
		{:else if filteredPostings.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>
					{#if searchValue.trim() === ''}
						{$t('components.posting-overview.no-postings')}
					{:else}
						{$t('components.posting-overview.no-results', {
							value: searchValue.trim()
						})}
					{/if}
				</ion-note>
			</div>
		{:else}
			<ion-list role="feed">
				{#each displayedPostings as posting (posting.id)}
					<PostingItem
						{posting}
						activity={activityPostingIdMap.get(posting.id)}
						{activities}
						{budgetCategories}
						{personsOfOrganization}
						onCompleted={async () => await onCompleted?.()}
						onEditStart={() => (isEditing = true)}
						onEditEnd={() => (isEditing = false)}
						{onDeleteActivityPosting}
						{onDeleteOrganizationPosting}
						{onUpdateActivityPosting}
						{onUpdateOrganizationPosting}
						{onTransferActivityPosting}
						{onTransferOrganizationPosting}
					/>
				{/each}
			</ion-list>
			<ion-infinite-scroll color="medium" class="mt-3" disabled={!hasMorePostings} onionInfinite={onLoadMore}>
				<ion-infinite-scroll-content
					loading-text={$t('components.posting-overview.loading')}
					loading-spinner="circular"
				>
				</ion-infinite-scroll-content>
			</ion-infinite-scroll>
		{/if}
	</div>
</Modal>
