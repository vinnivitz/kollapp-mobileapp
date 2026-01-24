<script lang="ts">
	import type {
		ActivityTO,
		OrganizationRole,
		PersonOfOrganizationTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		albumsOutline,
		cardOutline,
		cashOutline,
		flashOffOutline,
		medalOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Filter from '$lib/components/widgets/Filter.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import PostingItem from '$lib/components/widgets/PostingItem.svelte';
	import { t } from '$lib/locales';
	import {
		chipMultiSection,
		dateRangeSection,
		type FilterConfig,
		multiSelectSection,
		type SelectItem
	} from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { confirmationModal, formatter, getRoleTranslationFromRole, hasOrganizationRole } from '$lib/utility';

	type PostingsFilterState = {
		activityIds: number[];
		budgetCategoryIds: number[];
		dateRange: { from: string; to: string };
		postingTypes: PostingType[];
	};

	const { data } = $props();

	const personOfOrganization = $derived<PersonOfOrganizationTO | undefined>(
		$organizationStore?.personsOfOrganization.find((person) => person.id === data.personOfOrganizationId)
	);

	const postings = $derived<PostingTO[]>([
		...($organizationStore?.organizationPostings ?? []),
		...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
	]);

	const personOfOrganizationPostings = $derived<PostingTO[]>(
		postings.filter((posting) => posting.personOfOrganizationId === data.personOfOrganizationId)
	);

	const openPostings = $derived<PostingTO[]>(
		personOfOrganizationPostings.filter((posting) => posting.personOfOrganizationId > 0)
	);

	const totalCredit = $derived(
		personOfOrganizationPostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const totalDebit = $derived(
		personOfOrganizationPostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const balance = $derived(totalCredit - totalDebit);

	const roleLabel = $derived(
		personOfOrganization ? getRoleTranslationFromRole(personOfOrganization.organizationRole) : ''
	);

	const activityByPostingId = $derived(getActivityPostingIdMap());

	const organizationPostingIdSet = $derived(
		new Set<number>(($organizationStore?.organizationPostings ?? []).map((posting) => posting.id))
	);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	let searchValue = $state<string>('');
	let initializedPersonId = $state<number>();
	let previousPostingsCount = $state<number>(0);

	let filterState = $state<PostingsFilterState>({
		activityIds: [],
		budgetCategoryIds: [],
		dateRange: { from: format(new TZDate(), 'yyyy-MM-dd'), to: format(new TZDate(), 'yyyy-MM-dd') },
		postingTypes: ['DEBIT', 'CREDIT']
	});

	const filteredOpenPostings = $derived<PostingTO[]>(getFilteredPostings());

	const activityFilterItems = $derived<SelectItem[]>([
		...($organizationStore?.activities.map((activity) => ({
			data: { id: activity.id, label: activity.name },
			selected: true
		})) ?? []),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.members.slug.page.activity-filter-items.not-assigned') },
			icon: flashOffOutline,
			selected: true
		}
	]);

	const budgetCategoryFilterItems = $derived<SelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: true
		})) ?? []
	);

	function getDefaultBudgetCategoryFilterIds(): number[] {
		return $organizationStore?.budgetCategories.map((category) => category.id) ?? [];
	}

	function getDefaultActivityFilterIds(): number[] {
		return activityFilterItems.length > 0 ? activityFilterItems.map((item) => item.data.id) : [0];
	}

	function applyDefaultPostingsFilters(): void {
		searchValue = '';
		filterState = {
			activityIds: getDefaultActivityFilterIds(),
			budgetCategoryIds: getDefaultBudgetCategoryFilterIds(),
			dateRange: { from: getMinPostingDate(), to: getMaxPostingDate() },
			postingTypes: ['DEBIT', 'CREDIT']
		};
	}

	const filterConfig = $derived<FilterConfig<PostingsFilterState>>({
		onApply: (state) => (filterState = state),
		searchbar: {
			onSearch: (value) => (searchValue = value),
			placeholder: $t('routes.organization.members.slug.page.card.open-postings.search-placeholder')
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
				defaultValue: getDefaultBudgetCategoryFilterIds(),
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
							defaultValue: getDefaultActivityFilterIds(),
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
		if (initializedPersonId === data.personOfOrganizationId) return;
		initializedPersonId = data.personOfOrganizationId;
		applyDefaultPostingsFilters();
		previousPostingsCount = openPostings.length;
	});

	$effect(() => {
		const currentCount = openPostings.length;
		if (previousPostingsCount === 0 && currentCount > 0 && searchValue.trim() === '') {
			applyDefaultPostingsFilters();
		}
		previousPostingsCount = currentCount;
	});

	function getFilteredPostings(): PostingTO[] {
		const fromTime = new TZDate(filterState.dateRange.from).getTime();
		const toTime = new TZDate(filterState.dateRange.to).getTime();
		const allowedPostingTypes = new Set(filterState.postingTypes);
		const allowedActivityIds = new Set(filterState.activityIds);
		const allowedBudgetCategoryIds = new Set(filterState.budgetCategoryIds);
		const search = searchValue.trim().toLowerCase();

		return openPostings.filter((posting) => {
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
	}

	function getMinPostingDate(): string {
		if (openPostings.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let min = openPostings[0]!.date;
		for (const posting of openPostings) {
			if (posting.date < min) min = posting.date;
		}
		return min;
	}

	function getMaxPostingDate(): string {
		if (openPostings.length === 0) return format(new TZDate(), 'yyyy-MM-dd');
		let max = openPostings[0]!.date;
		for (const posting of openPostings) {
			if (posting.date > max) max = posting.date;
		}
		return max;
	}

	function getActivityPostingIdMap(): SvelteMap<number, ActivityTO> {
		const map = new SvelteMap<number, ActivityTO>();
		for (const activity of $organizationStore?.activities ?? []) {
			for (const activityPosting of activity.activityPostings ?? []) {
				map.set(activityPosting.id, activity);
			}
		}
		return map;
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return activityByPostingId.get(postingId);
	}

	async function onSelectRole(): Promise<void> {
		if (!personOfOrganization) return;
		const organizationId = $organizationStore?.id!;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () =>
						onGrantOrganizationRolePrompt(personOfOrganization.id, organizationId, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: personOfOrganization.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () =>
						onGrantOrganizationRolePrompt(personOfOrganization.id, organizationId, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: personOfOrganization.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	function getBudgetCategoryNameById(categoryId: number): string {
		return $organizationStore?.budgetCategories.find((category) => category.id === categoryId)?.name ?? '';
	}

	async function onGrantOrganizationRolePrompt(
		personOfOrganizationId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		if (role === personOfOrganization?.organizationRole) {
			return;
		}
		await confirmationModal({
			handler: async () => await grantOrganizationRole(personOfOrganizationId, organizationId, role),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}

	async function grantOrganizationRole(
		personOfOrganizationId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		await organizationService.grantRole(organizationId, personOfOrganizationId, role);
		await organizationStore.update(organizationId);
	}
</script>

<Layout title={$t('routes.organization.members.slug.page.title')} showBackButton>
	{#if personOfOrganization}
		{@render personOfOrganizationHeader()}
		{@render infoCard()}
		{@render postingsOverviewCard()}
		{#if openPostings.length > 0}
			{@render openPostingsCard()}
		{/if}
	{:else}
		{@render notFound()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet personOfOrganizationHeader()}
	<div class="flex flex-col items-center gap-4 py-4">
		<ion-icon color="medium" icon={personCircleOutline} class="h-24 w-24"></ion-icon>
		<h1 class="text-2xl font-bold">{personOfOrganization!.username}</h1>
	</div>
{/snippet}

{#snippet infoCard()}
	<Card title={$t('routes.organization.members.slug.page.card.info.title')}>
		<CustomItem clicked={isManager ? onSelectRole : undefined} icon={ribbonOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.info.role')}</ion-label>
				<ion-text>{roleLabel}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet postingsOverviewCard()}
	<Card title={$t('routes.organization.members.slug.page.card.postings.title')}>
		<CustomItem icon={cashOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.total')}</ion-label>
				<ion-text>{personOfOrganizationPostings.length}</ion-text>
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

{#snippet openPostingsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.open-postings.title')}>
		<Filter config={filterConfig} />
		{#each filteredOpenPostings as posting (posting.id)}
			{@render postingItem(posting)}
		{/each}
		{#if filteredOpenPostings.length === 0}
			{@render noSearchResults()}
		{/if}
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	{@const activity = getActivityPosting(posting.id)}
	<PostingItem
		{posting}
		{activity}
		budgetCategoryName={getBudgetCategoryNameById(posting.organizationBudgetCategoryId)}
		canEdit={isManager}
		canTransfer={isManager}
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

{#snippet notFound()}
	<div class="flex h-full items-center justify-center">
		<ion-text>{$t('routes.organization.members.slug.page.not-found')}</ion-text>
	</div>
{/snippet}

<!-- Modals -->
