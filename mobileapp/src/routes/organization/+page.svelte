<script lang="ts">
	import type {
		ActivityTO,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		albumsOutline,
		buildOutline,
		calendarClearOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		flashOffOutline,
		flashOutline,
		listOutline,
		locationOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		ribbonOutline,
		statsChartOutline,
		swapHorizontalOutline,
		trendingDownOutline,
		trendingUpOutline,
		warningOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';
	import { number } from 'yup';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createUpdatePostingSchema } from '$lib/api/schema/budget';
	import { budgetService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Filter from '$lib/components/widgets/Filter.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import MultiSelectItem from '$lib/components/widgets/ionic/MultiSelectItem.svelte';
	import PostingItem from '$lib/components/widgets/PostingItem.svelte';
	import { t } from '$lib/locales';
	import {
		chipMultiSection,
		dateRangeSection,
		type FilterConfig,
		Form,
		type FormActions,
		multiSelectSection,
		type SelectItem,
		TourStepId
	} from '$lib/models/ui';
	import { organizationStore, userStore } from '$lib/stores';
	import {
		customForm,
		formatter,
		getRoleTranslationFromRole,
		hasOrganizationRole,
		parser,
		triggerClickByLabel
	} from '$lib/utility';

	type Balance = {
		balance: string;
		credit: string;
		debit: string;
	};

	type PostingsFilterState = {
		activityIds: number[];
		budgetCategoryIds: number[];
		dateRange: { from: string; to: string };
		personOfOrganizationIds: number[];
		postingTypes: PostingType[];
	};

	type PostingFormModel = PostingCreateUpdateRequestTO & { activityId: number };

	const postingFormSchema = createUpdatePostingSchema().shape({
		activityId: number().optional().default(0)
	});
	let initializedOrganizationId = $state<number>();
	const organizations = $derived(organizationStore.organizations);
	const postings = $derived(
		[
			...($organizationStore?.organizationPostings ?? []),
			...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
		].toSorted((a, b) => new TZDate(b.date).getTime() - new TZDate(a.date).getTime())
	);
	const activityByPostingId = $derived(getActivityPostingIdMap());
	const organizationPostingIdSet = $derived(
		new Set<number>(($organizationStore?.organizationPostings ?? []).map((posting) => posting.id))
	);
	const balance = $derived(calculateBalance(postings ?? []));
	const organizationRole = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.organizationRole
	);
	const currentPersonOfOrganizationId = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.id ?? 0
	);
	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));
	let createPostingFormActions = $state<FormActions<PostingFormModel>>();

	let postingCreateModalOpen = $state<boolean>(false);
	let postingsHistoryModalOpen = $state<boolean>(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state<string>('');
	let previousPostingsCount = $state<number>(0);

	let selectedPostingType = $state<PostingType>('DEBIT');
	let descriptionExpanded = $state<boolean>(false);

	let filterState = $state<PostingsFilterState>({
		activityIds: [],
		budgetCategoryIds: [],
		dateRange: { from: format(new TZDate(), 'yyyy-MM-dd'), to: format(new TZDate(), 'yyyy-MM-dd') },
		personOfOrganizationIds: [],
		postingTypes: ['DEBIT', 'CREDIT']
	});

	const activitySelectItems = $derived<SelectItem[]>([
		...($organizationStore?.activities.map((activity) => ({
			data: { id: activity.id, label: activity.name },
			selected: false
		})) ?? []),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.page.activity-filter-item.not-assigned-to-activity') },
			icon: flashOffOutline,
			selected: true
		}
	]);

	const activityFilterItems = $derived<SelectItem[]>([
		...($organizationStore?.activities.map((activity) => ({
			data: { id: activity.id, label: activity.name },
			selected: true
		})) ?? []),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.page.activity-filter-item.not-assigned-to-activity') },
			icon: flashOffOutline,
			selected: true
		}
	]);

	const personOfOrganizationCreateItems = $derived<SelectItem[]>([
		...($organizationStore?.personsOfOrganization.map((person: PersonOfOrganizationTO) => ({
			data: { id: person.id, label: person.username },
			selected: false
		})) ?? []),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.page.person-of-organization-filter-item.unassigned') },
			icon: personAddOutline,
			selected: false
		}
	]);

	const personOfOrganizationFilterItems = $derived<SelectItem[]>([
		...($organizationStore?.personsOfOrganization.map((person: PersonOfOrganizationTO) => ({
			data: { id: person.id, label: person.username },
			selected: true
		})) ?? []),
		{
			color: 'tertiary',
			data: { id: 0, label: $t('routes.organization.page.person-of-organization-filter-item.unassigned') },
			icon: personAddOutline,
			selected: true
		}
	]);

	const budgetCategoryFilterItems = $derived<SelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: true
		})) ?? []
	);

	const organizationBudgetCategoryCreateItems = $derived<SelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: category.defaultCategory
		})) ?? []
	);

	const pendingMembersCount = $derived(
		$organizationStore?.personsOfOrganization.filter(
			(personOfOrganization) => personOfOrganization.status === 'PENDING'
		).length ?? 0
	);

	let organizationDescriptionNote = $state<HTMLIonNoteElement>();

	const organizationDescriptionNoteTruncated = $derived(
		organizationDescriptionNote && organizationDescriptionNote?.scrollWidth > organizationDescriptionNote?.clientWidth
	);

	const createPostingForm = new Form<PostingFormModel>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			postingCreateModalOpen = false;
			actions.setModel(postingFormSchema.getDefault());
		},
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) => {
			const { activityId, ...postingModel } = model;
			return activityId > 0
				? budgetService.createActivityPosting(
						$organizationStore?.id!,
						activityId,
						postingModel as PostingCreateUpdateRequestTO
					)
				: budgetService.createOrganizationPosting(
						$organizationStore?.id!,
						postingModel as PostingCreateUpdateRequestTO
					);
		},
		schema: postingFormSchema
	});

	const postingsFilterConfig = $derived<FilterConfig<PostingsFilterState>>({
		onApply: (state) => (filterState = state),
		searchbar: {
			onSearch: (value) => (postingsSearchValue = value),
			placeholder: $t('routes.organization.page.modal.postings-overview.search')
		},
		sections: [
			chipMultiSection<PostingType>('postingTypes', {
				defaultValue: ['DEBIT', 'CREDIT'],
				label: $t('routes.organization.page.modal.postings-filter.card.title'),
				options: [
					{
						color: 'success',
						icon: trendingUpOutline,
						label: $t('routes.organization.page.modal.postings-filter.card.credit'),
						value: 'CREDIT'
					},
					{
						color: 'danger',
						icon: trendingDownOutline,
						label: $t('routes.organization.page.modal.postings-filter.card.debit'),
						value: 'DEBIT'
					}
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinPostingDate(postings),
				defaultToValue: getMaxPostingDate(postings),
				label: $t('routes.organization.page.modal.postings-filter.card.date-range')
			}),
			multiSelectSection('personOfOrganizationIds', {
				allSelectedText: $t('routes.organization.page.modal.postings-filter.card.person-of-organization.all-selected'),
				defaultValue: getDefaultPersonFilterIds(),
				icon: peopleOutline,
				inputLabel: $t('routes.organization.page.modal.postings-filter.card.person-of-organization.select'),
				items: personOfOrganizationFilterItems,
				label: $t('routes.organization.page.modal.postings-filter.card.person-of-organization.label'),
				searchPlaceholder: $t('routes.organization.page.modal.postings-filter.card.person-of-organization.search')
			}),
			multiSelectSection('budgetCategoryIds', {
				allSelectedText: $t('routes.organization.page.modal.postings-filter.card.budget-category.all-selected'),
				defaultValue: getDefaultBudgetCategoryFilterIds(),
				icon: cardOutline,
				inputLabel: $t('routes.organization.page.modal.postings-filter.card.budget-category.select'),
				items: budgetCategoryFilterItems,
				label: $t('routes.organization.page.modal.postings-filter.card.budget-category.label'),
				searchPlaceholder: $t('routes.organization.page.modal.postings-filter.card.budget-category.search')
			}),
			...($organizationStore && $organizationStore.activities.length > 0
				? [
						multiSelectSection('activityIds', {
							allSelectedText: $t('routes.organization.page.modal.postings-filter.card.activities.all-selected'),
							defaultValue: getDefaultActivityFilterIds(),
							icon: albumsOutline,
							inputLabel: $t('routes.organization.page.modal.postings-filter.card.activities.select'),
							items: activityFilterItems,
							label: $t('routes.organization.page.modal.postings-filter.card.activities.label'),
							searchPlaceholder: $t('routes.organization.page.modal.postings-filter.card.activities.search')
						})
					]
				: [])
		],
		state: filterState,
		title: $t('routes.organization.page.modal.postings-filter.card.title')
	});

	$effect(() => {
		if (initializedOrganizationId === $organizationStore?.id) return;
		initializedOrganizationId = $organizationStore?.id;
		applyDefaultPostingsFilters();
		previousPostingsCount = postings.length;
	});

	$effect(() => {
		const currentCount = postings.length;
		if (previousPostingsCount === 0 && currentCount > 0 && postingsSearchValue.trim() === '') {
			applyDefaultPostingsFilters();
		}
		previousPostingsCount = currentCount;
		filteredPostings = getFilteredPostings();
	});

	function getActivityPostingIdMap(): SvelteMap<number, ActivityTO> {
		const map = new SvelteMap<number, ActivityTO>();
		for (const activity of $organizationStore?.activities ?? []) {
			for (const activityPosting of activity.activityPostings ?? []) {
				map.set(activityPosting.id, activity);
			}
		}
		return map;
	}

	function getMinPostingDate(postings: PostingTO[]): string {
		return postings.length > 0
			? new TZDate(Math.min(...postings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function getMaxPostingDate(postings: PostingTO[]): string {
		return postings.length > 0
			? new TZDate(Math.max(...postings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function setSelectedPostingType(
		type: PostingType,
		model: PostingFormModel,
		actions?: FormActions<PostingFormModel>
	): void {
		selectedPostingType = type;
		actions?.setModel({
			...model,
			type: selectedPostingType
		});
	}

	function getFilteredPostings(): PostingTO[] {
		const fromTime = new TZDate(filterState.dateRange.from).getTime();
		const toTime = new TZDate(filterState.dateRange.to).getTime();
		const allowedPostingTypes = new Set(filterState.postingTypes);
		const allowedActivityIds = new Set(filterState.activityIds);
		const allowedBudgetCategoryIds = new Set(filterState.budgetCategoryIds);
		const allowedPersonOfOrganizationIds = new Set(filterState.personOfOrganizationIds);
		const searchValue = postingsSearchValue.trim().toLowerCase();

		return postings.filter((posting) => {
			if (!allowedPostingTypes.has(posting.type)) return false;

			const postingTime = new TZDate(posting.date).getTime();
			if (postingTime < fromTime || postingTime > toTime) return false;

			if (!allowedBudgetCategoryIds.has(posting.organizationBudgetCategoryId)) return false;

			if (!allowedPersonOfOrganizationIds.has(posting.personOfOrganizationId)) return false;

			const isOrganizationPosting = organizationPostingIdSet.has(posting.id);
			const postingActivity = activityByPostingId.get(posting.id);
			const matchesActivities =
				isOrganizationPosting || (!!postingActivity && allowedActivityIds.has(postingActivity.id));
			if (!matchesActivities) return false;

			if (searchValue === '') return true;

			const matchesPurpose = posting.purpose.toLowerCase().includes(searchValue);
			const matchesCategoryName = getBudgetCategoryNameById(posting.organizationBudgetCategoryId)
				.toLowerCase()
				.includes(searchValue);
			const matchesUsername = !!getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)
				?.toLowerCase()
				.includes(searchValue);
			const matchesActivitiy = postingActivity?.name.toLowerCase().includes(searchValue);
			return matchesPurpose || matchesCategoryName || matchesUsername || matchesActivitiy;
		});
	}

	function getDefaultActivityFilterIds(): number[] {
		return activityFilterItems.length > 0 ? activityFilterItems.map((item) => item.data.id) : [];
	}

	function getDefaultBudgetCategoryFilterIds(): number[] {
		return $organizationStore?.budgetCategories.map((category) => category.id) ?? [];
	}

	function getDefaultPersonFilterIds(): number[] {
		return personOfOrganizationFilterItems.map((item) => item.data.id);
	}

	function applyDefaultPostingsFilters(): void {
		postingsSearchValue = '';
		filterState = {
			activityIds: getDefaultActivityFilterIds(),
			budgetCategoryIds: getDefaultBudgetCategoryFilterIds(),
			dateRange: { from: getMinPostingDate(postings), to: getMaxPostingDate(postings) },
			personOfOrganizationIds: getDefaultPersonFilterIds(),
			postingTypes: ['DEBIT', 'CREDIT']
		};
	}

	function calculateBalance(postings: PostingTO[]): Balance {
		let totalIncome = 0,
			totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === 'CREDIT') totalIncome += posting.amountInCents;
			else if (posting.type === 'DEBIT') totalExpense += posting.amountInCents;
		}
		const balance = totalIncome - totalExpense;
		return {
			balance: formatter.currency(balance),
			credit: formatter.currency(totalIncome),
			debit: formatter.currency(totalExpense)
		};
	}

	async function onOrganizationSelect(): Promise<void> {
		const actionSheet = await actionSheetController.create({
			buttons: $organizations.map((organization) => ({
				handler: async () => await organizationStore.update(organization.id),
				role: $organizationStore?.id === organization.id ? 'selected' : undefined,
				text: organization.name
			})),
			header: $t('routes.organization.page.modal.select-organization.header')
		});
		await actionSheet.present();
	}

	async function onOpenCreatePosting(): Promise<void> {
		selectedPostingType = createPostingForm.model.type;
		createPostingFormActions?.setModel(
			postingFormSchema.cast({
				personOfOrganizationId: currentPersonOfOrganizationId
			} satisfies Partial<PostingFormModel>)
		);
		postingCreateModalOpen = true;
	}

	function getPostingTypeTranslationByPostingType(type: PostingType): string {
		return type === 'DEBIT'
			? $t('routes.organization.page.posting-translation.debit')
			: $t('routes.organization.page.posting-translation.cedit');
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return activityByPostingId.get(postingId);
	}

	function canEditPosting(personOfOrganizationId: number): boolean {
		return isManager || currentPersonOfOrganizationId === personOfOrganizationId;
	}

	function getUsernameByPersonOfOrganizationId(personOfOrganizationId: number): string | undefined {
		return $organizationStore?.personsOfOrganization.find((person) => person.id === personOfOrganizationId)?.username;
	}

	function getBudgetCategoryNameById(categoryId: number): string {
		return $organizationStore?.budgetCategories.find((category) => category.id === categoryId)?.name ?? '';
	}
</script>

<Layout title={$t('routes.organization.page.title')}>
	{#if $organizationStore}
		{@render collectiveName()}
		{@render collectiveInfo()}
		{@render budgetCard()}
		{@render activityList()}
		{@render collectiveList()}
	{:else if $organizations.length === 0}
		{@render noCollectiveCard()}
	{/if}
	{@render miscellaneousList()}
</Layout>

<!-- Snippets -->

{#snippet noCollectiveCard()}
	<Card border="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon color="warning" icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-note>{$t('routes.organization.page.no-collective.note')}</ion-note>
		</div>
	</Card>
{/snippet}

{#snippet activityList()}
	<ion-list inset class="mt-0 pt-0">
		<ion-list-header>{$t('routes.organization.page.activity-list.list.header')}</ion-list-header>
		{#if isManager}
			<LabeledItem
				label={$t('routes.organization.page.activity-list.list.create-activity')}
				icon={flashOutline}
				clicked={async () => {
					await goto(resolve('/organization/activities'));
					await triggerClickByLabel($t('routes.organization.page.activity-list.list.create-activity'));
				}}
			/>
		{/if}
		<LabeledItem
			label={$t('routes.organization.page.activity-list.list.manage-activities')}
			icon={calendarClearOutline}
			indexed="/organization/activities"
			clicked={() => goto(resolve('/organization/activities'))}
		/>
	</ion-list>
{/snippet}

{#snippet collectiveName()}
	<div class="flex items-center justify-center gap-4 text-2xl">
		<ion-text class="font-bold">{$organizationStore?.name}</ion-text>
		{#if $organizations.length > 1}
			<Button fill="outline" clicked={onOrganizationSelect} icon={swapHorizontalOutline} />
		{/if}
	</div>
{/snippet}

{#snippet collectiveInfo()}
	<Card
		border="primary"
		tourId={TourStepId.ORGANIZATION.INFO}
		classList="text-center cursor-pointer"
		clicked={organizationDescriptionNoteTruncated ? () => (descriptionExpanded = !descriptionExpanded) : undefined}
	>
		<div class="flex flex-col items-center justify-center gap-3">
			<ion-text
				bind:this={organizationDescriptionNote}
				class:max-h-screen={descriptionExpanded}
				class:whitespace-pre-line={descriptionExpanded}
				class="max-h-6 overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-500 ease-in-out"
			>
				{$organizationStore?.description}
			</ion-text>
			<div class="flex flex-row items-center justify-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{$organizationStore?.place}</ion-text>
			</div>
		</div>
		<div class="mt-3 flex flex-row items-center justify-center gap-1">
			<ion-icon icon={ribbonOutline}></ion-icon>
			<ion-text class="font-semibold">
				{$t('routes.organization.page.collective-info.role', {
					value: getRoleTranslationFromRole(organizationRole!)
				})}
			</ion-text>
		</div>
	</Card>
{/snippet}

{#snippet collectiveList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.page.collective-list.list.header')}</ion-list-header>
		<LabeledItem
			badge={pendingMembersCount > 0 ? `${pendingMembersCount}` : undefined}
			indexed="/organization/members"
			clicked={() => goto(resolve('/organization/members'))}
			icon={peopleOutline}
			label={$t('routes.organization.page.collective-list.list.members')}
		/>
		{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
			<LabeledItem
				indexed="/organization/update-data"
				accessible="ROLE_ORGANIZATION_MANAGER"
				clicked={() => goto(resolve('/organization/update-data'))}
				icon={buildOutline}
				label={$t('routes.organization.page.collective-list.list.update-info')}
			/>
			<LabeledItem
				indexed="/organization/budget-categories"
				accessible="ROLE_ORGANIZATION_MANAGER"
				clicked={() => goto(resolve('/organization/budget-categories'))}
				icon={cardOutline}
				label={$t('routes.organization.page.collective-list.list.budget-categories')}
			/>
		{/if}
		{#if $organizations.length > 1}
			<LabeledItem
				indexed="/organization"
				clicked={onOrganizationSelect}
				icon={swapHorizontalOutline}
				label={$t('routes.organization.page.collective-list.list.change-collective')}
			/>
		{/if}
		<LabeledItem
			indexed="/organization/leave"
			clicked={() => goto(resolve('/organization/leave'))}
			icon={logOutOutline}
			label={$t('routes.organization.page.collective-list.list.leave')}
		/>
	</ion-list>
{/snippet}

{#snippet miscellaneousList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.page.general.list.header')}</ion-list-header>

		<LabeledItem
			indexed="/organization/register"
			clicked={() => goto(resolve('/organization/register'))}
			icon={createOutline}
			label={$t('routes.organization.page.general.list.register')}
		/>
		<LabeledItem
			indexed="/organization/join"
			clicked={() => goto(resolve('/organization/join'))}
			icon={personAddOutline}
			label={$t('routes.organization.page.general.list.join')}
		/>
	</ion-list>
{/snippet}

{#snippet budgetCard()}
	<Card
		border="secondary"
		tourId={TourStepId.ORGANIZATION.BUDGET}
		titleIconStart={cardOutline}
		title={$t('routes.organization.page.budget-card.card.title')}
	>
		<div class="flex flex-col items-center justify-center gap-2">
			<ion-text class="text-xl font-bold">{balance?.balance}</ion-text>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="success" icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm" color="medium">
					{$t('routes.organization.page.budget-card.card.total-credit', { value: balance?.credit })}
				</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="danger" icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm" color="medium">
					{$t('routes.organization.page.budget-card.card.total-debit', { value: balance?.debit })}:
				</ion-text>
			</div>
		</div>
		<div class="mt-3 flex flex-col gap-1">
			<Button
				indexed="/organization"
				expand="block"
				label={$t('routes.organization.page.budget-card.card.add-posting')}
				color="primary"
				icon={cashOutline}
				clicked={onOpenCreatePosting}
			/>
			<Button
				indexed="/organization"
				icon={listOutline}
				expand="block"
				fill="outline"
				label={$t('routes.organization.page.budget-card.card.postings-overview')}
				clicked={() => (postingsHistoryModalOpen = true)}
			/>
			<Button
				indexed="/organization/budget-statistics"
				icon={statsChartOutline}
				expand="block"
				fill="outline"
				label={$t('routes.organization.page.budget-card.card.statistics')}
				clicked={() => goto(resolve('/organization/budget-statistics'))}
			/>
		</div>
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	{@const canEdit = canEditPosting(posting.personOfOrganizationId)}
	{@const activity = getActivityPosting(posting.id)}
	<PostingItem
		{posting}
		{activity}
		budgetCategoryName={getBudgetCategoryNameById(posting.organizationBudgetCategoryId)}
		canDelete={canEdit}
		{canEdit}
		canTransfer={isManager && posting.personOfOrganizationId > 0}
		showMemberSelect={isManager}
		username={posting.personOfOrganizationId > 0
			? getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)
			: undefined}
	/>
{/snippet}

<!-- Modals -->

<!-- Create Posting Modal -->
<Modal open={postingCreateModalOpen} dismissed={() => (postingCreateModalOpen = false)}>
	<Card title={getPostingTypeTranslationByPostingType(selectedPostingType)}>
		<form use:customForm={createPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.modal.create-posting.credit')}
					clicked={() => setSelectedPostingType('CREDIT', createPostingForm.model, createPostingFormActions)}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.modal.create-posting.debit')}
					clicked={() => setSelectedPostingType('DEBIT', createPostingForm.model, createPostingFormActions)}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.page.modal.create-posting.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem name="amountInCents" label={$t('routes.organization.page.modal.create-posting.amount')} />
			<DatetimeInputItem name="date" label={$t('routes.organization.page.modal.create-posting.date')} />
			<MultiSelectItem
				hidden={!isManager}
				name="personOfOrganizationId"
				icon={peopleOutline}
				multiple={false}
				label={$t('routes.organization.page.modal.create-posting.person-of-organization.select')}
				searchPlaceholder={$t('routes.organization.page.modal.create-posting.person-of-organization.search')}
				items={personOfOrganizationCreateItems}
			/>
			{#if $organizationStore && $organizationStore.activities.length > 0}
				<MultiSelectItem
					name="activityId"
					icon={flashOutline}
					multiple={false}
					label={$t('routes.organization.page.modal.create-posting.activities.select')}
					searchPlaceholder={$t('routes.organization.page.modal.create-posting.activities.search')}
					items={activitySelectItems}
				/>
			{/if}
			<MultiSelectItem
				name="organizationBudgetCategoryId"
				icon={cardOutline}
				multiple={false}
				label={$t('routes.organization.page.modal.create-posting.organization-budget-category.select')}
				searchPlaceholder={$t('routes.organization.page.modal.create-posting.organization-budget-category.search')}
				items={organizationBudgetCategoryCreateItems}
			/>
		</form>
	</Card>
</Modal>

<!-- Postings History Modal -->
<Modal
	open={postingsHistoryModalOpen}
	initialBreakPoint={0.75}
	dismissed={() => (postingsHistoryModalOpen = false)}
	informational
	lazy
>
	<div class="relative">
		<div class="sticky top-0 left-0 z-10 mb-3 flex flex-col">
			<Filter config={postingsFilterConfig} />
		</div>
		{#if filteredPostings.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>
					{#if postingsSearchValue.trim() === ''}
						{$t('routes.organization.page.modal.postings-overview.no-postings')}
					{:else}
						{$t('routes.organization.page.modal.postings-overview.no-results', {
							value: postingsSearchValue.trim()
						})}
					{/if}
				</ion-note>
			</div>
		{:else}
			<ion-list>
				{#each filteredPostings as posting (posting.id)}
					{@render postingItem(posting)}
				{/each}
			</ion-list>
		{/if}
	</div>
</Modal>
