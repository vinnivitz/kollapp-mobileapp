<script lang="ts">
	import type { PageData } from './$types';
	import type {
		ActivityUpdateRequestTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { AppLauncher } from '@capacitor/app-launcher';
	import { TZDate } from '@date-fns/tz';
	import { CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { isPlatform, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		addOutline,
		calendarClearOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		filterOutline,
		listOutline,
		locationOutline,
		mapOutline,
		peopleOutline,
		personAddOutline,
		personOutline,
		refreshOutline,
		saveOutline,
		sendOutline,
		trashBinOutline,
		trashOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteSet } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createUpdatePostingSchema } from '$lib/api/schema/budget';
	import { updateActivitySchema } from '$lib/api/schema/organization';
	import { activityService, budgetService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import MultiSelectItem from '$lib/components/widgets/ionic/MultiSelectItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import {
		type FabButtonButtons,
		Form,
		type FormActions,
		type ItemSlidingOption,
		type SelectItem
	} from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		clone,
		confirmationModal,
		customForm,
		formatter,
		getDateFnsLocale,
		getValidationResult,
		hasOrganizationRole,
		parser,
		promptCalendarPermissionRequest
	} from '$lib/utility';

	type PostingBalance = {
		balance: string;
		credit: string;
		debit: string;
	};

	type PostingsFilterDraft = {
		budgetCategoryIds: number[];
		fromDate: string;
		personOfOrganizationIds: number[];
		postingTypes: PostingType[];
		toDate: string;
	};

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));
	const postings = $derived(
		(activity?.activityPostings ?? []).toSorted((a, b) => {
			return new TZDate(b.date).getTime() - new TZDate(a.date).getTime();
		})
	);
	const currentPersonOfOrganizationId = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.id ?? 0
	);
	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const postingBalance = $derived(calculateBalance(postings ?? []));

	const activityEventButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: $t('routes.organization.activities.slug.page.fab.delete')
		},
		{
			color: 'primary',
			handler: onOpenActivityModal,
			icon: createOutline,
			label: $t('routes.organization.activities.slug.page.fab.edit')
		}
	];

	let createPostingFormActions: FormActions<PostingCreateUpdateRequestTO>;
	let updatePostingFormActions: FormActions<PostingCreateUpdateRequestTO>;
	let updateActivityFormActions: FormActions<ActivityUpdateRequestTO>;

	let createPostingModalOpen = $state<boolean>(false);
	let updatePostingModalOpen = $state<boolean>(false);
	let updateActivityModalOpen = $state<boolean>(false);
	let postingHistoryModalOpen = $state<boolean>(false);

	let updateActivityModelTouched = $state<boolean>(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state<string>('');
	const selectedPostingTypes = new SvelteSet<PostingType>(['DEBIT', 'CREDIT']);

	let filterOpen = $state<boolean>(false);

	let isAssignedToPersonOfOrganization = $state<boolean>(false);
	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');

	let initialized = $state<boolean>(false);
	let fromFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));
	let filteredBudgetCategoryIds = $state<number[]>([]);
	let filteredPersonOfOrganizationIds = $state<number[]>([]);
	let hasNonSearchFiltersApplied = $state<boolean>(false);

	let postingsFilterDraft = $state<PostingsFilterDraft>({
		budgetCategoryIds: [],
		fromDate: format(new TZDate(), 'yyyy-MM-dd'),
		personOfOrganizationIds: [],
		postingTypes: ['DEBIT', 'CREDIT'],
		toDate: format(new TZDate(), 'yyyy-MM-dd')
	});

	const personOfOrganizationFilterItems = $derived<SelectItem[]>([
		...($organizationStore?.personsOfOrganization.map((person) => ({
			data: { id: person.id, label: person.username },
			selected: true
		})) ?? []),
		{
			color: 'tertiary',
			data: {
				id: 0,
				label: $t('routes.organization.activities.slug.page.modal.activity-filter.card.members.unassigned')
			},
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

	const personOfOrganizationCreateItems = $derived<SelectItem[]>([
		...($organizationStore?.personsOfOrganization.map((person) => ({
			data: { id: person.id, label: person.username },
			selected: false
		})) ?? []),
		{
			color: 'tertiary',
			data: {
				id: 0,
				label: $t(
					'routes.organization.activities.slug.page.modal.create-posting.form.person-of-organization.unassigned'
				)
			},
			icon: personAddOutline,
			selected: false
		}
	]);

	const personOfOrganizationUpdateItems = $derived<SelectItem[]>(
		$organizationStore?.personsOfOrganization.map((person) => ({
			data: { id: person.id, label: person.username },
			selected: false
		})) ?? []
	);

	const createPostingForm = new Form({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			createPostingModalOpen = false;
			actions.setModel(createUpdatePostingSchema().getDefault());
		},
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: (model) => budgetService.createActivityPosting($organizationStore?.id!, activity?.id!, model),
		schema: createUpdatePostingSchema()
	});

	const updatePostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updatePostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) =>
			budgetService.updateActivityPosting($organizationStore?.id!, activity?.id!, selectedPosting?.id!, model),
		schema: createUpdatePostingSchema()
	});

	const updateActivityForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updateActivityModalOpen = false;
			updateActivityModelTouched = false;
		},
		exposedActions: (actions) => (updateActivityFormActions = actions),
		onTouched: () => (updateActivityModelTouched = true),
		request: async (model) => await activityService.update($organizationStore?.id!, activity?.id!, model),
		schema: updateActivitySchema()
	});

	$effect(() => {
		if (initialized) return;
		initialized = true;
		applyDefaultPostingsFilters();
	});

	$effect(() => {
		if (postings) filteredPostings = getFilteredPostings();
	});

	$effect(() => {
		if ($organizationStore && !activity) goto(resolve('/organization/activities'));
	});

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

	function hasSameIdsAsSet(a: number[], b: number[]): boolean {
		const set = new Set(a);
		for (const id of b) {
			if (!set.has(id)) return false;
		}
		return true;
	}

	function getDefaultPersonFilterIds(): number[] {
		return personOfOrganizationFilterItems.map((item) => item.data.id);
	}

	function getDefaultBudgetCategoryFilterIds(): number[] {
		return $organizationStore?.budgetCategories.map((category) => category.id) ?? [];
	}

	function updateHasNonSearchFiltersApplied(): void {
		if (postings.length === 0) {
			hasNonSearchFiltersApplied = false;
			return;
		}

		const defaultPersonIds = getDefaultPersonFilterIds();
		const defaultBudgetCategoryIds = getDefaultBudgetCategoryFilterIds();
		const defaultFromDate = getMinPostingDate(postings);
		const defaultToDate = getMaxPostingDate(postings);
		const isDefaultPostingTypes = selectedPostingTypes.has('DEBIT') && selectedPostingTypes.has('CREDIT');
		const isDefaultBudgetCategories = hasSameIdsAsSet(filteredBudgetCategoryIds, defaultBudgetCategoryIds);

		hasNonSearchFiltersApplied =
			!isDefaultPostingTypes ||
			fromFilterDate !== defaultFromDate ||
			toFilterDate !== defaultToDate ||
			!isDefaultBudgetCategories ||
			!hasSameIdsAsSet(filteredPersonOfOrganizationIds, defaultPersonIds);
	}

	function getFilteredPostings(): PostingTO[] {
		if (!initialized) return postings;

		const fromTime = new TZDate(fromFilterDate).getTime();
		const toTime = new TZDate(toFilterDate).getTime();
		const allowedBudgetCategoryIds = new Set(filteredBudgetCategoryIds);
		const allowedPersonIds = new Set(filteredPersonOfOrganizationIds);
		const search = postingsSearchValue.trim().toLowerCase();

		return postings.filter((posting) => {
			if (!selectedPostingTypes.has(posting.type)) return false;

			const postingTime = new TZDate(posting.date).getTime();
			if (postingTime < fromTime || postingTime > toTime) return false;

			if (!allowedBudgetCategoryIds.has(posting.organizationBudgetCategoryId)) {
				return false;
			}

			if (!allowedPersonIds.has(posting.personOfOrganizationId)) return false;

			if (search === '') return true;

			const matchesPurpose = posting.purpose.toLowerCase().includes(search);
			const matchesActivityName = activity?.name.toLowerCase().includes(search) ?? false;
			return matchesPurpose || matchesActivityName;
		});
	}

	function applyDefaultPostingsFilters(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		postingsSearchValue = '';

		selectedPostingTypes.clear();
		selectedPostingTypes.add('DEBIT');
		selectedPostingTypes.add('CREDIT');

		filteredBudgetCategoryIds = getDefaultBudgetCategoryFilterIds();
		filteredPersonOfOrganizationIds = getDefaultPersonFilterIds();
		syncDraftFilters();
		hasNonSearchFiltersApplied = false;
	}

	function syncDraftFilters(): void {
		postingsFilterDraft = {
			budgetCategoryIds: [...filteredBudgetCategoryIds],
			fromDate: fromFilterDate,
			personOfOrganizationIds: [...filteredPersonOfOrganizationIds],
			postingTypes: [...selectedPostingTypes],
			toDate: toFilterDate
		};
	}

	function toggleDraftPostingTypeSelected(type: PostingType): void {
		if (postingsFilterDraft.postingTypes.includes(type)) {
			postingsFilterDraft = {
				...postingsFilterDraft,
				postingTypes: postingsFilterDraft.postingTypes.filter((t) => t !== type)
			};
			return;
		}

		postingsFilterDraft = {
			...postingsFilterDraft,
			postingTypes: [...postingsFilterDraft.postingTypes, type]
		};
	}

	function onConfirmSelectDraftPostingPersonsOfOrganization(ids: number[]): void {
		postingsFilterDraft = { ...postingsFilterDraft, personOfOrganizationIds: ids };
	}

	function onConfirmSelectDraftPostingBudgetCategories(ids: number[]): void {
		postingsFilterDraft = { ...postingsFilterDraft, budgetCategoryIds: ids };
	}

	function resetDraftFilter(): void {
		postingsFilterDraft = {
			budgetCategoryIds: getDefaultBudgetCategoryFilterIds(),
			fromDate: getMinPostingDate(postings),
			personOfOrganizationIds: getDefaultPersonFilterIds(),
			postingTypes: ['DEBIT', 'CREDIT'],
			toDate: getMaxPostingDate(postings)
		};
		applyDraftFilter();
	}

	function applyDraftFilter(): void {
		fromFilterDate = postingsFilterDraft.fromDate;
		toFilterDate = postingsFilterDraft.toDate;
		filteredBudgetCategoryIds = [...postingsFilterDraft.budgetCategoryIds];
		filteredPersonOfOrganizationIds = [...postingsFilterDraft.personOfOrganizationIds];
		selectedPostingTypes.clear();
		for (const type of postingsFilterDraft.postingTypes) {
			selectedPostingTypes.add(type);
		}
		filterOpen = false;
		syncDraftFilters();
		updateHasNonSearchFiltersApplied();
	}

	function onPostingFilterModalDismiss(): void {
		filterOpen = false;
		resetDraftFilter();
	}

	async function onDeleteActivity(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.activities.slug.page.modal.delete-activity.confirm'),
			handler: deleteActivity
		});
	}

	async function deleteActivity(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		await activityService.remove($organizationStore?.id!, activity?.id!);
		await organizationStore.update($organizationStore?.id!);
		updateActivityModalOpen = false;
		await loader.dismiss();
		await goto(resolve('/organization/activities'));
	}

	function getPostingItemSlidingOptions(posting: PostingTO): ItemSlidingOption[] {
		const options: ItemSlidingOption[] = [
			{
				color: 'danger',
				handler: () => onDeletePosting(posting.id),
				icon: trashBinOutline
			},
			{
				color: 'primary',
				handler: () => onOpenUpdatePostingModal(posting),
				icon: createOutline
			}
		];

		if (isManager && posting.personOfOrganizationId > 0) {
			options.push({
				color: 'tertiary',
				handler: () => onTransferPosting(posting),
				icon: sendOutline
			});
		}

		return options;
	}

	async function onTransferPosting(posting: PostingTO): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.activities.slug.page.modal.transfer-posting.confirm'),
			handler: () => transferPosting(posting.id),
			header: $t('routes.organization.activities.slug.page.modal.transfer-posting.header'),
			message: $t('routes.organization.activities.slug.page.modal.transfer-posting.message')
		});
	}

	async function transferPosting(postingId: number): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id!;
		const result = getValidationResult(
			await budgetService.transferActivityPosting(organizationId, activity?.id!, postingId)
		);
		if (result.valid) {
			await organizationStore.update(organizationId);
		}
		await loader.dismiss();
	}

	function onOpenActivityModal(): void {
		updateActivityFormActions.setModel(clone(activity));
		updateActivityModalOpen = true;
	}

	function calculateBalance(postings: PostingTO[]): PostingBalance {
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

	async function onOpenCreatePosting(): Promise<void> {
		selectedPostingType = createPostingForm.model.type;
		createPostingFormActions.setModel(
			createUpdatePostingSchema().cast({
				personOfOrganizationId: currentPersonOfOrganizationId
			} satisfies Partial<PostingCreateUpdateRequestTO>)
		);
		createPostingModalOpen = true;
	}

	function getCreatePostingTitle(type: PostingType): string {
		return type === 'DEBIT'
			? $t('routes.organization.activities.slug.page.create-posting.title.debit')
			: $t('routes.organization.activities.slug.page.create-posting.title.credit');
	}

	async function onOpenLocation(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		const url = isPlatform('ios')
			? `maps://?q=${encodeURIComponent(activity?.location ?? '')}`
			: `geo:0,0?q=${encodeURIComponent(activity?.location ?? '')}`;
		await AppLauncher.openUrl({ url });
	}

	async function onAddToCalendar(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		if (!(await promptCalendarPermissionRequest()) || !activity) return;
		await CapacitorCalendar.createEventWithPrompt({
			alerts: [30],
			endDate: addDays(Date.now(), 1).getTime(),
			isAllDay: false,
			location: activity.location,
			startDate: Date.now(),
			title: activity.name,
			url: `kollapp://activities/${activity.id}`
		});
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
	}

	async function onDeletePosting(postingId: number): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.activities.slug.page.modal.delete-posting.modal.confirm'),
			handler: () => deletePosting(postingId)
		});
	}

	async function deletePosting(postingId: number): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const result = getValidationResult(
				await budgetService.removeActivityPosting(organizationId, activity?.id!, postingId)
			);
			if (result.valid) {
				await organizationStore.update(organizationId);
			}
		}
		await loader.dismiss();
	}

	async function onOpenUpdatePostingModal(posting: PostingTO): Promise<void> {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		isAssignedToPersonOfOrganization = posting.personOfOrganizationId !== 0;
		updatePostingFormActions.setModel(clone(selectedPosting));
		updatePostingModalOpen = true;
	}

	function resetFilter(): void {
		applyDefaultPostingsFilters();
		filterOpen = false;
	}

	function setPostingType(type: PostingType): void {
		selectedPostingType = type;
	}

	function getUsernameByPersonOfOrganizationId(personOfOrganizationId: number): string | undefined {
		return $organizationStore?.personsOfOrganization.find((person) => person.id === personOfOrganizationId)?.username;
	}

	function getBudgetCategoryNameById(categoryId: number): string {
		return $organizationStore?.budgetCategories.find((category) => category.id === categoryId)?.name ?? '';
	}

	function canEditPosting(personOfOrganizationId: number): boolean {
		return isManager || currentPersonOfOrganizationId === personOfOrganizationId;
	}
</script>

<Layout title={$t('routes.organization.activities.slug.page.title')} showBackButton>
	{@render activitySummary()}
	{@render postingsSummary()}
	{#if isManager}
		<FabButton
			indexedLabel={$t('routes.organization.activities.slug.page.action-button')}
			icon={addOutline}
			buttons={activityEventButtons}
		/>
	{/if}
</Layout>

<!-- Snippets -->

{#snippet activitySummary()}
	<Card border="secondary" title={activity?.name} classList="mb-5" clicked={onOpenActivityModal}>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<div class="flex items-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{activity?.location}</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new TZDate(), 5), {
						addSuffix: true,
						includeSeconds: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
		</div>
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				icon={mapOutline}
				size="small"
				fill="solid"
				color="light"
				label={$t('routes.organization.activities.slug.page.event-summary.open-in-map')}
				clicked={onOpenLocation}
			/>
			<Button
				icon={calendarClearOutline}
				size="small"
				fill="solid"
				color="light"
				label={$t('routes.organization.activities.slug.page.event-summary.add-to-calendar')}
				clicked={onAddToCalendar}
			/>
		</div>
	</Card>
{/snippet}

{#snippet postingsSummary()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline} class="text-xl"></ion-icon>
				<ion-text class="text-lg font-bold">
					{$t('routes.organization.activities.slug.page.postings-summary.heading')}
				</ion-text>
			</div>
			<ion-text class="text-xl font-bold">{postingBalance?.balance}</ion-text>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="success" icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm" color="medium">
					{$t('routes.organization.activities.slug.page.postings-summary.total-credit', {
						value: postingBalance?.credit
					})}
				</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="danger" icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm" color="medium">
					{$t('routes.organization.activities.slug.page.postings-summary.total-debit', {
						value: postingBalance?.debit
					})}
				</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text class="text-sm" color="medium">
					{$t('routes.organization.activities.slug.page.postings-summary.total-postings', { value: postings?.length })}
				</ion-text>
			</div>
		</div>
		<div class="mt-3 flex flex-col gap-1">
			<Button
				expand="block"
				label={$t('routes.organization.activities.slug.page.postings-summary.add-posting')}
				color="primary"
				icon={cashOutline}
				clicked={onOpenCreatePosting}
			/>
			<Button
				icon={listOutline}
				expand="block"
				fill="outline"
				label={$t('routes.organization.activities.slug.page.postings-summary.posting-history')}
				clicked={() => (postingHistoryModalOpen = true)}
			/>
		</div>
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	<CustomItem
		slidingOptions={canEditPosting(posting.personOfOrganizationId) ? getPostingItemSlidingOptions(posting) : undefined}
		iconColor={posting.type === 'CREDIT' ? 'success' : 'danger'}
		icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
	>
		<div class="flex w-full flex-col items-center">
			<div class="flex w-full items-center justify-between">
				<ion-text class="truncate font-semibold">{posting.purpose}</ion-text>
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
				{#if posting.personOfOrganizationId > 0}
					<ion-note class="flex items-center justify-center gap-1 text-sm">
						<ion-icon icon={personOutline}></ion-icon>
						<div class="truncate">{getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)}</div>
					</ion-note>
				{/if}
			</div>
		</div>
	</CustomItem>
{/snippet}

<!-- Modals -->

<!-- Update Activity Modal -->
<Modal
	dismissed={() => (updateActivityModalOpen = false)}
	touched={updateActivityModelTouched}
	open={updateActivityModalOpen}
	confirmLabel={$t('routes.organization.activities.slug.page.modal.update-activity.confirm')}
>
	<Card title={$t('routes.organization.activities.slug.page.modal.update-activity.card.title')}>
		<form use:customForm={updateActivityForm}>
			<InputItem
				name="name"
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.name')}
				icon={documentOutline}
			/>
			<LocationInputItem
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.location')}
				name="location"
			/>
			<DatetimeInputItem
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.date')}
				name="date"
			/>
		</form>
	</Card>
</Modal>

<!-- Create Posting Modal -->
<Modal open={createPostingModalOpen} dismissed={() => (createPostingModalOpen = false)}>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createPostingForm!}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.activities.slug.page.modal.create-posting.form.credit')}
					clicked={() => (selectedPostingType = 'CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.activities.slug.page.modal.create-posting.form.debit')}
					clicked={() => (selectedPostingType = 'DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.activities.slug.page.modal.create-posting.form.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem
				name="amountInCents"
				label={$t('routes.organization.activities.slug.page.modal.create-posting.form.amount')}
			/>
			<DatetimeInputItem
				label={$t('routes.organization.activities.slug.page.modal.create-posting.form.date')}
				name="date"
			/>
			{#if isManager}
				<MultiSelectItem
					name="personOfOrganizationId"
					icon={peopleOutline}
					multiple={false}
					label={$t('routes.organization.activities.slug.page.modal.create-posting.form.person-of-organization.label')}
					searchPlaceholder={$t(
						'routes.organization.activities.slug.page.modal.create-posting.form.person-of-organization.search'
					)}
					items={personOfOrganizationCreateItems}
				/>
			{/if}
		</form>
	</Card>
</Modal>

<!-- Update Posting -->
<Modal open={updatePostingModalOpen} dismissed={() => (updatePostingModalOpen = false)}>
	<Card title={$t('routes.organization.activities.slug.page.modal.update-posting.card.title')}>
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.activities.slug.page.modal.update-posting.card.form.credit')}
					clicked={() => setPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.activities.slug.page.modal.update-posting.card.form.debit')}
					clicked={() => setPostingType('DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.activities.slug.page.modal.update-posting.card.form.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem
				name="amountInCents"
				label={$t('routes.organization.activities.slug.page.modal.update-posting.card.form.amount')}
			/>
			<DatetimeInputItem
				label={$t('routes.organization.activities.slug.page.modal.update-posting.card.form.date')}
				name="date"
			/>
			<MultiSelectItem
				name="personOfOrganizationId"
				icon={peopleOutline}
				multiple={false}
				hidden={!isManager || !isAssignedToPersonOfOrganization}
				label={$t(
					'routes.organization.activities.slug.page.modal.update-posting.card.form.person-of-organization.label'
				)}
				searchPlaceholder={$t(
					'routes.organization.activities.slug.page.modal.update-posting.card.form.person-of-organization.search'
				)}
				items={personOfOrganizationUpdateItems}
			/>
		</form>
	</Card>
</Modal>

<!-- Posting History Modal -->
<Modal
	initialBreakPoint={0.75}
	open={postingHistoryModalOpen}
	dismissed={() => (postingHistoryModalOpen = false)}
	informational
	lazy
>
	<div class="relative">
		<div class="sticky top-0 left-0 z-10 mb-3 flex flex-col">
			<div class="flex items-center justify-center gap-2">
				<ion-searchbar
					class="w-full"
					debounce={100}
					placeholder={$t('routes.organization.activities.slug.page.modal.posting-history.searchbar')}
					value={postingsSearchValue}
					onionInput={onSearchPostings}
				></ion-searchbar>
				<Button icon={filterOutline} clicked={() => (filterOpen = true)} />
			</div>
			{#if hasNonSearchFiltersApplied}
				<div class="flex justify-center">
					<Button
						size="small"
						fill="outline"
						color="danger"
						icon={refreshOutline}
						label={$t('routes.organization.activities.slug.page.modal.posting-history.reset-filters')}
						clicked={resetFilter}
					/>
				</div>
			{/if}
		</div>
		{#if filteredPostings.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>{$t('routes.organization.activities.slug.page.modal.posting-history.no-postings')}</ion-note>
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

<!-- Activity Filters Popover Modal -->
<Popover extended open={filterOpen} dismissed={onPostingFilterModalDismiss} lazy>
	<Card title={$t('routes.organization.activities.slug.page.modal.activity-filter.card.title')} classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => toggleDraftPostingTypeSelected('CREDIT')}
				color="success"
				selected={postingsFilterDraft.postingTypes.includes('CREDIT')}
				icon={trendingUpOutline}
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.credit')}
			/>
			<Chip
				clicked={() => toggleDraftPostingTypeSelected('DEBIT')}
				color="danger"
				selected={postingsFilterDraft.postingTypes.includes('DEBIT')}
				icon={trendingDownOutline}
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.debit')}
			/>
		</div>
		<DatetimeInputItem
			max={postingsFilterDraft.toDate}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.date.from')}
			value={postingsFilterDraft.fromDate}
			changed={(value) => (postingsFilterDraft = { ...postingsFilterDraft, fromDate: value })}
		/>
		<DatetimeInputItem
			min={postingsFilterDraft.fromDate}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.date.to')}
			value={postingsFilterDraft.toDate}
			changed={(value) => (postingsFilterDraft = { ...postingsFilterDraft, toDate: value })}
		/>
		<MultiSelectItem
			value={postingsFilterDraft.personOfOrganizationIds}
			changed={onConfirmSelectDraftPostingPersonsOfOrganization}
			allSelectedText={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.all-selected')}
			icon={peopleOutline}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.label')}
			searchPlaceholder={$t(
				'routes.organization.activities.slug.page.modal.activity-filter.card.members.search-placeholder'
			)}
			items={personOfOrganizationFilterItems}
		/>
		<MultiSelectItem
			value={postingsFilterDraft.budgetCategoryIds}
			changed={onConfirmSelectDraftPostingBudgetCategories}
			allSelectedText={$t(
				'routes.organization.activities.slug.page.modal.activity-filter.card.budget-category.all-selected'
			)}
			noneSelectedText={$t(
				'routes.organization.activities.slug.page.modal.activity-filter.card.budget-category.none-selected'
			)}
			icon={cardOutline}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.budget-category.select')}
			searchPlaceholder={$t(
				'routes.organization.activities.slug.page.modal.activity-filter.card.budget-category.search'
			)}
			items={budgetCategoryFilterItems}
		/>
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.reset')}
				color="danger"
				icon={refreshOutline}
				fill="outline"
				clicked={resetDraftFilter}
			/>
			<Button
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={applyDraftFilter}
			/>
		</div>
	</Card>
</Popover>
