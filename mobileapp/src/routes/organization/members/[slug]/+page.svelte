<script lang="ts">
	import type {
		ActivityTO,
		OrganizationRole,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, loadingController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		calendarClearOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		flashOutline,
		medalOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		sendOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { createUpdatePostingSchema } from '$lib/api/schema/budget/index.js';
	import { budgetService, organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Filter from '$lib/components/widgets/Filter.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import { t } from '$lib/locales';
	import {
		chipSection,
		dateRangeSection,
		type FilterConfig,
		Form,
		type FormActions,
		type ItemSlidingOption,
		multiSelectSection,
		type SelectItem
	} from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import {
		confirmationModal,
		customForm,
		formatter,
		getRoleTranslationFromRole,
		getValidationResult,
		hasOrganizationRole,
		parser
	} from '$lib/utility';

	type TypeFilter = 'all' | 'credit' | 'debit';

	type PostingsFilterState = {
		budgetCategoryIds: number[];
		dateRange: { from: string; to: string };
		typeFilter: TypeFilter;
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

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	let searchValue = $state<string>('');

	let filterState = $state<PostingsFilterState>({
		budgetCategoryIds: getDefaultBudgetCategoryFilterIds(),
		dateRange: { from: '', to: '' },
		typeFilter: 'all'
	});

	let initialized = $state<boolean>(false);

	const filteredOpenPostings = $derived<PostingTO[]>(
		filterPostings(
			openPostings,
			searchValue,
			filterState.typeFilter,
			filterState.dateRange.from,
			filterState.dateRange.to,
			filterState.budgetCategoryIds
		)
	);

	let postingUpdateModalOpen = $state<boolean>(false);
	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');
	let updatePostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();

	const updatePostingForm = new Form<PostingCreateUpdateRequestTO>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			postingUpdateModalOpen = false;
			actions.setModel(createUpdatePostingSchema().getDefault());
		},
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) => {
			const organizationId = $organizationStore?.id!;
			const postingId = selectedPosting?.id!;
			const activity = $organizationStore?.activities.find((activity) =>
				activity.activityPostings.some((activityPosting) => activityPosting.id === postingId)
			);
			return activity
				? budgetService.updateActivityPosting(organizationId, activity.id, postingId, model)
				: budgetService.updateOrganizationPosting(organizationId, postingId, model);
		},
		schema: createUpdatePostingSchema()
	});

	const budgetCategoryFilterItems = $derived<SelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: true
		})) ?? []
	);

	function getDefaultBudgetCategoryFilterIds(): number[] {
		return $organizationStore?.budgetCategories.map((category) => category.id) ?? [];
	}

	const filterConfig = $derived<FilterConfig<PostingsFilterState>>({
		onApply: (state) => (filterState = state),
		searchbar: {
			onSearch: (value) => (searchValue = value),
			placeholder: $t('routes.organization.members.slug.page.card.open-postings.search-placeholder')
		},
		sections: [
			chipSection<TypeFilter>('typeFilter', {
				defaultValue: 'all',
				label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.label'),
				options: [
					{
						label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.all'),
						value: 'all'
					},
					{
						color: 'success',
						icon: trendingUpOutline,
						label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.credit'),
						value: 'credit'
					},
					{
						color: 'danger',
						icon: trendingDownOutline,
						label: $t('routes.organization.members.slug.page.modal.filter.card.type-filter.debit'),
						value: 'debit'
					}
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinPostingDate(),
				defaultToValue: getMaxPostingDate(),
				label: $t('routes.organization.members.slug.page.modal.filter.card.date-range.label'),
				max: getMaxPostingDate(),
				min: getMinPostingDate()
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
			})
		],
		state: filterState,
		title: $t('routes.organization.members.slug.page.modal.filter.card.title')
	});

	$effect(() => {
		if (openPostings.length > 0 && !initialized) {
			const minDate = getMinPostingDate();
			const maxDate = getMaxPostingDate();
			filterState = {
				...filterState,
				dateRange: { from: minDate, to: maxDate }
			};
			initialized = true;
		}
	});

	function filterPostings(
		postings: PostingTO[],
		search: string,
		type: TypeFilter,
		fromDate: string,
		toDate: string,
		budgetCategoryIds: number[]
	): PostingTO[] {
		const searchTerm = search.trim().toLowerCase();

		return postings.filter(
			(posting) =>
				matchesSearch(posting, searchTerm) &&
				matchesTypeFilter(posting, type) &&
				matchesDateRange(posting, fromDate, toDate) &&
				matchesBudgetCategoryFilter(posting, budgetCategoryIds)
		);
	}

	function matchesBudgetCategoryFilter(posting: PostingTO, budgetCategoryIds: number[]): boolean {
		return budgetCategoryIds.includes(posting.organizationBudgetCategoryId);
	}

	function matchesSearch(posting: PostingTO, searchTerm: string): boolean {
		return searchTerm === '' || posting.purpose.toLowerCase().includes(searchTerm);
	}

	function matchesTypeFilter(posting: PostingTO, type: TypeFilter): boolean {
		if (type === 'credit') return posting.type === 'CREDIT';
		if (type === 'debit') return posting.type === 'DEBIT';
		return true;
	}

	function matchesDateRange(posting: PostingTO, fromDate: string, toDate: string): boolean {
		if (fromDate && posting.date < fromDate) return false;
		if (toDate && posting.date > toDate) return false;
		return true;
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

	function isActivityPosting(postingId: number): boolean {
		return activityByPostingId.has(postingId);
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return activityByPostingId.get(postingId);
	}

	function getPostingSlidingOptions(posting: PostingTO): ItemSlidingOption[] {
		return [
			{
				color: 'primary',
				handler: () => onOpenUpdatePostingModal(posting),
				icon: createOutline
			},
			{
				color: 'tertiary',
				handler: () => onTransferPosting(posting),
				icon: sendOutline
			}
		];
	}

	function onOpenUpdatePostingModal(posting: PostingTO): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		updatePostingFormActions?.setModel(
			createUpdatePostingSchema().cast({
				amountInCents: posting.amountInCents,
				date: posting.date,
				personOfOrganizationId: posting.personOfOrganizationId ?? 0,
				purpose: posting.purpose,
				type: posting.type
			}) as PostingCreateUpdateRequestTO
		);
		postingUpdateModalOpen = true;
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		updatePostingFormActions?.setModel({
			...updatePostingForm.model,
			type
		});
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

	async function onTransferPosting(posting: PostingTO): Promise<void> {
		await confirmationModal({
			handler: () => transferPosting(posting),
			header: $t('routes.organization.members.slug.page.modal.transfer-posting.header'),
			message: $t('routes.organization.members.slug.page.modal.transfer-posting.message')
		});
	}

	async function transferPosting(posting: PostingTO): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id!;
		const activity = $organizationStore?.activities.find((a) => a.activityPostings.some((ap) => ap.id === posting.id));
		const result = activity
			? getValidationResult(await budgetService.transferActivityPosting(organizationId, activity.id, posting.id))
			: getValidationResult(await budgetService.transferOrganizationPosting(organizationId, posting.id));
		if (result.valid) {
			await organizationStore.update(organizationId);
		}
		await loader.dismiss();
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
	<CustomItem
		slidingOptions={isManager ? getPostingSlidingOptions(posting) : undefined}
		iconColor={posting.type === 'CREDIT' ? 'success' : 'danger'}
		icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
	>
		<div class="mt-2 flex w-full flex-col items-center gap-2">
			<div class="flex w-full items-center justify-between">
				<ion-text class="font-semibold">{posting.purpose}</ion-text>
				<ion-text color={posting.type === 'CREDIT' ? 'success' : 'danger'} class="font-bold text-nowrap">
					{posting.type === 'CREDIT' ? '+' : '-'}
					{formatter.currency(posting.amountInCents)}
				</ion-text>
			</div>
			<div class="flex w-full flex-wrap items-center justify-start gap-2">
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={calendarClearOutline}></ion-icon>
					<ion-label>{format(new TZDate(posting.date), 'PP')}</ion-label>
				</ion-note>
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={cardOutline}></ion-icon>
					<ion-label class="truncate">{getBudgetCategoryNameById(posting.organizationBudgetCategoryId)}</ion-label>
				</ion-note>
				{#if isActivityPosting(posting.id)}
					<ion-note class="flex items-center justify-center gap-1 text-sm">
						<ion-icon icon={flashOutline}></ion-icon>
						<div class="truncate">{getActivityPosting(posting.id)?.name}</div>
					</ion-note>
				{/if}
			</div>
		</div>
	</CustomItem>
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

<!-- Update Posting Modal -->
<Modal open={postingUpdateModalOpen} dismissed={() => (postingUpdateModalOpen = false)}>
	<Card title={$t('routes.organization.members.slug.page.modal.update-posting.title')}>
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.members.slug.page.modal.update-posting.credit')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.members.slug.page.modal.update-posting.debit')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.members.slug.page.modal.update-posting.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem
				name="amountInCents"
				label={$t('routes.organization.members.slug.page.modal.update-posting.amount')}
			/>
			<DatetimeInputItem name="date" label={$t('routes.organization.members.slug.page.modal.update-posting.date')} />
		</form>
	</Card>
</Modal>
