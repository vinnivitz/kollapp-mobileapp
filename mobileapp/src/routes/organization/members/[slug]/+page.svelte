<script lang="ts">
	import type { ExportPostingsConfig } from '$lib/models/export-postings';
	import type { ActivityTO, OrganizationRole, PostingTO, PostingType } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		albumsOutline,
		cardOutline,
		cashOutline,
		downloadOutline,
		flashOffOutline,
		medalOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService, organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import PostingFilter from '$lib/components/widgets/budget/PostingFilter.svelte';
	import PostingItem from '$lib/components/widgets/budget/PostingItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import { t } from '$lib/locales';
	import {
		chipMultiSection,
		dateRangeSection,
		type FilterConfig,
		type MultiSelectItem,
		multiSelectSection
	} from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import {
		confirmationModal,
		exportPostings,
		formatter,
		getOrganizationName,
		getRoleTranslationFromRole,
		hasOrganizationRole,
		withLoader
	} from '$lib/utility';

	type PostingsFilterState = {
		activityIds: number[];
		budgetCategoryIds: number[];
		dateRange: { from: string; to: string };
		postingTypes: PostingType[];
	};

	const { data } = $props();

	const PAGE_SIZE = 10;

	const personOfOrganization = $derived(
		$organizationStore?.personsOfOrganization.find(
			(personOfOrganization) => personOfOrganization.id === data.personOfOrganizationId
		)
	);
	let isEditingPosting = $state<boolean>(false);
	let displayCount = $state<number>(PAGE_SIZE);
	let stablePostings = $state<PostingTO[]>([]);

	const postings = $derived<PostingTO[]>(
		[
			...($organizationStore?.organizationPostings ?? []),
			...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
		].filter((posting) => posting.personOfOrganizationId === data.personOfOrganizationId)
	);

	const totalCredit = $derived(
		stablePostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const totalDebit = $derived(
		stablePostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const balance = $derived(totalCredit - totalDebit);

	const activityByPostingId = $derived.by(() => {
		const map = new SvelteMap<number, ActivityTO>();
		for (const activity of $organizationStore?.activities ?? []) {
			for (const activityPosting of activity.activityPostings ?? []) {
				map.set(activityPosting.id, activity);
			}
		}
		return map;
	});

	const organizationPostingIdSet = $derived(
		new Set<number>(($organizationStore?.organizationPostings ?? []).map((posting) => posting.id))
	);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	let searchValue = $state<string>('');

	let filterState = $state<PostingsFilterState>();

	const filteredPostings = $derived.by(() => {
		if (!filterState) return stablePostings;

		const fromTime = new TZDate(filterState.dateRange.from).getTime();
		const toTime = new TZDate(filterState.dateRange.to).getTime();
		const allowedPostingTypes = new Set(filterState.postingTypes);
		const allowedActivityIds = new Set(filterState.activityIds);
		const allowedBudgetCategoryIds = new Set(filterState.budgetCategoryIds);
		const search = searchValue.trim().toLowerCase();

		return stablePostings.filter((posting) => {
			if (!allowedPostingTypes.has(posting.type)) return false;

			const postingTime = new TZDate(posting.date).getTime();
			if (postingTime < fromTime || postingTime > toTime) return false;

			if (!allowedBudgetCategoryIds.has(posting.organizationBudgetCategoryId)) {
				return false;
			}

			const postingActivity = activityByPostingId.get(posting.id);
			const isOrganizationPosting = organizationPostingIdSet.has(posting.id);
			const matchesActivities =
				(allowedActivityIds.has(0) && isOrganizationPosting) ||
				(!!postingActivity && allowedActivityIds.has(postingActivity.id));
			if (!matchesActivities) return false;

			if (search === '') return true;
			return (
				posting.purpose.toLowerCase().includes(search) ||
				(postingActivity?.name.toLowerCase().includes(search) ?? false)
			);
		});
	});

	const displayedPostings = $derived(filteredPostings.slice(0, displayCount));

	const hasMorePostings = $derived(displayCount < filteredPostings.length);

	const activityFilterItems = $derived<MultiSelectItem[]>([
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.members.slug.page.activity-filter-items.not-assigned') },
			icon: flashOffOutline,
			selected: true
		},
		...($organizationStore?.activities.map((activity) => ({
			data: { id: activity.id, label: activity.name },
			selected: true
		})) ?? [])
	]);

	const budgetCategoryFilterItems = $derived<MultiSelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: true
		})) ?? []
	);

	const filterConfig = $derived<FilterConfig<PostingsFilterState>>({
		onApply: (state) => {
			displayCount = PAGE_SIZE;
			filterState = state;
		},
		searchbar: {
			onSearch: (value) => (searchValue = value),
			placeholder: $t('routes.organization.members.slug.page.card.open-postings.search-placeholder'),
			value: searchValue
		},
		sections: [
			chipMultiSection<PostingType>('postingTypes', {
				defaultValue: ['DEBIT', 'CREDIT'],
				label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.label'),
				options: [
					{
						color: 'success',
						icon: trendingUpOutline,
						label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.credit'),
						value: 'CREDIT'
					},
					{
						color: 'danger',
						icon: trendingDownOutline,
						label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.debit'),
						value: 'DEBIT'
					}
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinPostingDate(),
				defaultToValue: getMaxPostingDate(),
				label: $t('routes.organization.members.slug.page.modal.filter.card.date-range.label')
			}),
			multiSelectSection('budgetCategoryIds', {
				allSelectedText: $t('routes.organization.members.slug.page.modal.filter.card.budget-categories.all-selected'),
				icon: cardOutline,
				inputLabel: $t('routes.organization.members.slug.page.modal.filter.card.budget-categories.input-label'),
				items: budgetCategoryFilterItems,
				label: $t('routes.organization.members.slug.page.modal.filter.card.budget-categories.label'),
				searchPlaceholder: $t(
					'routes.organization.members.slug.page.modal.filter.card.budget-categories.search-placeholder'
				)
			}),
			...($organizationStore && $organizationStore.activities.length > 0
				? [
						multiSelectSection('activityIds', {
							allSelectedText: $t('routes.organization.members.slug.page.modal.filter.card.activities.all-selected'),
							icon: albumsOutline,
							inputLabel: $t('routes.organization.members.slug.page.modal.filter.card.activities.select'),
							items: activityFilterItems,
							label: $t('routes.organization.members.slug.page.modal.filter.card.activities.label'),
							searchPlaceholder: $t('routes.organization.members.slug.page.modal.filter.card.activities.search')
						})
					]
				: [])
		],
		state: filterState,
		title: $t('routes.organization.members.slug.page.modal.filter.card.title')
	});

	$effect(() => {
		if (!isEditingPosting) {
			stablePostings = [...postings];
		}
	});

	$effect(() => {
		if (!personOfOrganization) {
			goto(resolve('/organization/members'));
		}
	});

	function getMinPostingDate(): string {
		if (stablePostings.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let min = stablePostings[0]!.date;
		for (const posting of stablePostings) {
			if (posting.date < min) min = posting.date;
		}
		return min;
	}

	function getMaxPostingDate(): string {
		if (stablePostings.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let max = stablePostings[0]!.date;
		for (const posting of stablePostings) {
			if (posting.date > max) max = posting.date;
		}
		return max;
	}

	async function onSelectRole(): Promise<void> {
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => onGrantOrganizationRolePrompt(personOfOrganization?.id!, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: personOfOrganization?.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () => onGrantOrganizationRolePrompt(personOfOrganization?.id!, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: personOfOrganization?.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function onGrantOrganizationRolePrompt(personOfOrganizationId: number, role: OrganizationRole): Promise<void> {
		if (role === personOfOrganization?.organizationRole) return;
		await confirmationModal({
			handler: async () => void withLoader(() => organizationService.grantRole(personOfOrganizationId, role)),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}

	function onLoadMore(event: CustomEvent): void {
		displayCount += PAGE_SIZE;
		(event.target as HTMLIonInfiniteScrollElement).complete();
	}

	function onExportPostings(): void {
		const config: ExportPostingsConfig = {
			activities: $organizationStore?.activities!,
			budgetCategories: $organizationStore?.budgetCategories!,
			organizationName: getOrganizationName()!,
			personsOfOrganization: $organizationStore?.personsOfOrganization!,
			title: $t('routes.organization.activities.slug.page.postings-summary.export.title')
		};

		exportPostings(filteredPostings, config);
	}
</script>

<Layout title={$t('routes.organization.members.slug.page.title')} showBackButton>
	{@render header()}
	{@render infoCard()}
	{@render postingStatisticsCard()}
	{#if stablePostings.length > 0}
		{@render assignedPostingsCard()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet header()}
	<div class="flex flex-col items-center gap-4 py-4">
		<ion-icon color="medium" icon={personCircleOutline} class="h-24 w-24"></ion-icon>
		<h1 class="text-2xl font-bold">{personOfOrganization!.username}</h1>
	</div>
{/snippet}

{#snippet infoCard()}
	<Card title={$t('routes.organization.members.slug.page.card.info.title')} lazy>
		<CustomItem clicked={isManager ? onSelectRole : undefined} icon={ribbonOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.info.role')}</ion-label>
				<ion-text>{getRoleTranslationFromRole(personOfOrganization?.organizationRole!)}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet postingStatisticsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.postings.title')} lazy>
		<CustomItem icon={cashOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.total')}</ion-label>
				<ion-text>{stablePostings.length}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={trendingUpOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.credit')}</ion-label>
				<ion-text color="success">{formatter.currency(totalCredit)}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={trendingDownOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.debit')}</ion-label>
				<ion-text color="danger">{formatter.currency(totalDebit)}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={cardOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.balance')}</ion-label>
				<ion-text color={balance >= 0 ? 'success' : 'danger'}>{formatter.currency(balance)}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet assignedPostingsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.open-postings.title')} lazy>
		<div class="sticky top-0 left-0 z-10 mb-3 flex flex-row items-center justify-between gap-2">
			<PostingFilter classList="flex-1" config={filterConfig} />
			<Button color="tertiary" icon={downloadOutline} clicked={onExportPostings}></Button>
		</div>
		<div class="overflow-auto">
			<ion-list role="feed">
				{#each displayedPostings as posting (posting.id)}
					{@render postingItem(posting)}
				{/each}
			</ion-list>
			<ion-infinite-scroll color="medium" class="mt-3" disabled={!hasMorePostings} onionInfinite={onLoadMore}>
				<ion-infinite-scroll-content
					loading-text={$t('routes.organization.members.slug.page.card.open-postings.loading')}
					loading-spinner="circular"
				></ion-infinite-scroll-content>
			</ion-infinite-scroll>
		</div>
		{#if filteredPostings.length === 0}
			{@render noSearchResults()}
		{/if}
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	<PostingItem
		{posting}
		activity={activityByPostingId.get(posting.id)}
		activities={$organizationStore?.activities!}
		budgetCategories={$organizationStore?.budgetCategories!}
		personsOfOrganization={$organizationStore?.personsOfOrganization!}
		onEditStart={() => (isEditingPosting = true)}
		onEditEnd={() => (isEditingPosting = false)}
		onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
		onUpdateActivityPosting={budgetService.updateActivityPosting}
		onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
		onTransferActivityPosting={budgetService.transferActivityPosting}
		onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
		onDeleteActivityPosting={budgetService.deleteActivityPosting}
	/>
{/snippet}

{#snippet noSearchResults()}
	<div class="flex items-center justify-center py-4">
		<ion-note>
			{#if searchValue}
				{$t('routes.organization.members.slug.page.card.open-postings.no-results', {
					value: searchValue.trim()
				})}
			{:else}
				{$t('routes.organization.members.slug.page.card.open-postings.no-results-filtered')}
			{/if}
		</ion-note>
	</div>
{/snippet}
