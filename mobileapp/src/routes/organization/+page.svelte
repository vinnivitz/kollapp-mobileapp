<script lang="ts">
	import type {
		ActivityTO,
		OrganizationTO,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		albumsOutline,
		arrowForwardOutline,
		buildOutline,
		calendarClearOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOffOutline,
		flashOutline,
		listOutline,
		locationOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		personOutline,
		refreshOutline,
		ribbonOutline,
		saveOutline,
		sendOutline,
		swapHorizontalOutline,
		trashBinOutline,
		trendingDownOutline,
		trendingUpOutline,
		warningOutline
	} from 'ionicons/icons';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { number } from 'yup';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import { createUpdatePostingSchema } from '$lib/api/validation/budget';
	import Layout from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import MultiSelectItem from '$lib/components/widgets/ionic/MultiSelectItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption, type SelectItem } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		confirmationModal,
		customForm,
		formatter,
		getDateFnsLocale,
		getRoleTranslationFromRole,
		getValidationResult,
		hasOrganizationRole,
		parser,
		triggerClickByLabel
	} from '$lib/utility';

	type Balance = {
		balance: string;
		credit: string;
		debit: string;
	};

	type PostingsFilterDraft = {
		activityIds: number[];
		fromDate: string;
		personOfOrganizationIds: number[];
		postingTypes: PostingType[];
		toDate: string;
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
	let updatePostingFormActions = $state<FormActions<PostingFormModel>>();

	let postingCreateModalOpen = $state<boolean>(false);
	let postingUpdateModalOpen = $state<boolean>(false);
	let postingsHistoryModalOpen = $state<boolean>(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state<string>('');

	let postingsFilterModalOpen = $state<boolean>(false);

	let isAssignedToPersonOfOrganization = $state<boolean>(false);

	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');
	const selectedPostingTypes = new SvelteSet<PostingType>(['DEBIT', 'CREDIT']);
	let descriptionExpanded = $state<boolean>(false);
	let fromFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));

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

	const personOfOrganizationUpdateItems = $derived<SelectItem[]>(
		$organizationStore?.personsOfOrganization.map((person: PersonOfOrganizationTO) => ({
			data: { id: person.id, label: person.username },
			selected: false
		})) ?? []
	);

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

	let filteredActivityIds = $state<number[]>([]);
	let filteredPersonOfOrganizationIds = $state<number[]>([]);
	let postingsFilterDraft = $state<PostingsFilterDraft>({
		activityIds: [],
		fromDate: format(new TZDate(), 'yyyy-MM-dd'),
		personOfOrganizationIds: [],
		postingTypes: ['DEBIT', 'CREDIT'],
		toDate: format(new TZDate(), 'yyyy-MM-dd')
	});
	let hasNonSearchFiltersApplied = $state<boolean>(false);

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

	const updatePostingForm = new Form<PostingFormModel>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			postingUpdateModalOpen = false;
			actions.setModel(postingFormSchema.getDefault());
		},
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) => {
			const { activityId, ...postingModel } = model;
			const organizationId = $organizationStore?.id!;
			const postingId = selectedPosting?.id!;
			return activityId > 0
				? budgetService.updateActivityPosting(
						organizationId,
						activityId,
						postingId,
						postingModel as PostingCreateUpdateRequestTO
					)
				: budgetService.updateOrganizationPosting(
						organizationId,
						postingId,
						postingModel as PostingCreateUpdateRequestTO
					);
		},
		schema: postingFormSchema
	});

	$effect(() => {
		if (initializedOrganizationId === $organizationStore?.id) return;
		initializedOrganizationId = $organizationStore?.id;
		applyDefaultPostingsFilters();
	});

	$effect(() => {
		if (postings) filteredPostings = getFilteredPostings();
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

	function isActivityPosting(postingId: number): boolean {
		return activityByPostingId.has(postingId);
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

	function hasSameIdsAsSet(a: number[], b: number[]): boolean {
		const set = new Set(a);
		for (const id of b) {
			if (!set.has(id)) return false;
		}
		return true;
	}

	function updateHasNonSearchFiltersApplied(): void {
		if (postings.length === 0) {
			hasNonSearchFiltersApplied = false;
			return;
		}

		const defaultActivityIds = getDefaultActivityFilterIds();
		const defaultPersonIds = getDefaultPersonFilterIds();
		const defaultFromDate = getMinPostingDate(postings);
		const defaultToDate = getMaxPostingDate(postings);
		const isDefaultPostingTypes = selectedPostingTypes.has('DEBIT') && selectedPostingTypes.has('CREDIT');

		hasNonSearchFiltersApplied =
			!isDefaultPostingTypes ||
			fromFilterDate !== defaultFromDate ||
			toFilterDate !== defaultToDate ||
			!hasSameIdsAsSet(filteredActivityIds, defaultActivityIds) ||
			!hasSameIdsAsSet(filteredPersonOfOrganizationIds, defaultPersonIds);
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
		const fromTime = new TZDate(fromFilterDate).getTime();
		const toTime = new TZDate(toFilterDate).getTime();
		const allowedActivityIds = new Set(filteredActivityIds);
		const allowedPersonIds = new Set(filteredPersonOfOrganizationIds);
		const search = postingsSearchValue.trim().toLowerCase();

		return postings.filter((posting) => {
			if (!selectedPostingTypes.has(posting.type)) return false;

			const postingTime = new TZDate(posting.date).getTime();
			if (postingTime < fromTime || postingTime > toTime) return false;

			if (!allowedPersonIds.has(posting.personOfOrganizationId)) return false;

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

	function getDefaultActivityFilterIds(): number[] {
		return activityFilterItems.length > 0 ? activityFilterItems.map((item) => item.data.id) : [0];
	}

	function getDefaultPersonFilterIds(): number[] {
		return personOfOrganizationFilterItems.map((item) => item.data.id);
	}

	function applyDefaultPostingsFilters(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		postingsSearchValue = '';

		selectedPostingTypes.clear();
		selectedPostingTypes.add('DEBIT');
		selectedPostingTypes.add('CREDIT');

		filteredActivityIds = getDefaultActivityFilterIds();
		filteredPersonOfOrganizationIds = getDefaultPersonFilterIds();
		syncDraftFilters();
		hasNonSearchFiltersApplied = false;
	}

	function syncDraftFilters(): void {
		postingsFilterDraft = {
			activityIds: [...filteredActivityIds],
			fromDate: fromFilterDate,
			personOfOrganizationIds: [...filteredPersonOfOrganizationIds],
			postingTypes: [...selectedPostingTypes],
			toDate: toFilterDate
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

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
	}

	async function onDeletePosting(postingId: number): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.page.modal.delete-posting.confirm-text'),
			handler: () => deletePosting(postingId)
		});
	}

	async function deletePosting(postingId: number): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id!;
		const activity = activityByPostingId.get(postingId);
		const result = activity
			? getValidationResult(await budgetService.removeActivityPosting(organizationId, activity.id, postingId))
			: getValidationResult(await budgetService.removeOrganizationPosting(organizationId, postingId));
		if (result.valid) {
			await organizationStore.update(organizationId);
		}
		await loader.dismiss();
	}

	async function onTransferPosting(posting: PostingTO): Promise<void> {
		await confirmationModal({
			handler: () => transferPosting(posting.id),
			header: $t('routes.organization.page.modal.transfer-posting.header'),
			message: $t('routes.organization.page.modal.transfer-posting.message')
		});
	}

	async function transferPosting(postingId: number): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id!;
		const activity = activityByPostingId.get(postingId);
		const result = activity
			? getValidationResult(await budgetService.transferActivityPosting(organizationId, activity.id, postingId))
			: getValidationResult(await budgetService.transferOrganizationPosting(organizationId, postingId));
		if (result.valid) {
			await organizationStore.update(organizationId);
		}
		await loader.dismiss();
	}

	function onOpenUpdatePostingModal(posting: PostingTO): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		const activityId = activityByPostingId.get(posting.id)?.id ?? 0;
		updatePostingFormActions?.setModel(
			postingFormSchema.cast({
				activityId,
				amountInCents: posting.amountInCents,
				date: posting.date,
				personOfOrganizationId: posting.personOfOrganizationId ?? 0,
				purpose: posting.purpose,
				type: posting.type
			}) as PostingFormModel
		);
		isAssignedToPersonOfOrganization = posting.personOfOrganizationId !== 0;
		postingUpdateModalOpen = true;
	}

	function resetFilter(): void {
		applyDefaultPostingsFilters();
		postingsFilterModalOpen = false;
	}

	function resetDraftFilter(): void {
		const defaultActivityFilterIds = getDefaultActivityFilterIds();
		postingsFilterDraft = {
			activityIds: defaultActivityFilterIds,
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
		filteredActivityIds = [...postingsFilterDraft.activityIds];
		filteredPersonOfOrganizationIds = [...postingsFilterDraft.personOfOrganizationIds];
		selectedPostingTypes.clear();
		for (const type of postingsFilterDraft.postingTypes) {
			selectedPostingTypes.add(type);
		}
		postingsFilterModalOpen = false;
		syncDraftFilters();
		updateHasNonSearchFiltersApplied();
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return activityByPostingId.get(postingId);
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

	function onConfirmSelectDraftPostingActivities(ids: number[]): void {
		postingsFilterDraft = { ...postingsFilterDraft, activityIds: ids };
	}

	function onConfirmSelectDraftPostingPersonsOfOrganization(ids: number[]): void {
		postingsFilterDraft = { ...postingsFilterDraft, personOfOrganizationIds: ids };
	}

	function canEditPosting(personOfOrganizationId: number): boolean {
		return isManager || currentPersonOfOrganizationId === personOfOrganizationId;
	}

	function onPostingFilterModalDismiss(): void {
		postingsFilterModalOpen = false;
		resetDraftFilter();
	}

	function getUsernameByPersonOfOrganizationId(personOfOrganizationId: number): string | undefined {
		return $organizationStore?.personsOfOrganization.find((person) => person.id === personOfOrganizationId)?.username;
	}
</script>

<Layout title={$t('routes.organization.page.title')}>
	{#if $organizationStore}
		{@render collectiveName($organizationStore)}
		{@render collectiveInfo()}
		{@render budgetCard()}
		{#if $organizationStore.activities.length > 0}
			{@render upcomingEvent($organizationStore.activities)}
		{/if}
		{@render eventsList()}
		{@render collectiveList()}
	{:else if $organizations.length === 0}
		{@render noCollectiveCard()}
	{/if}
	{@render generalList()}
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

{#snippet upcomingEvent(activities: ActivityTO[])}
	<Card
		border="secondary"
		title={$t('routes.organization.page.upcoming-event.card.title')}
		classList="mt-5"
		clicked={() => goto(resolve('/organization/activities/[slug]', { slug: activities[0]!.id.toString() }))}
		titleIconEnd={arrowForwardOutline}
	>
		<div class="flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activities[0]?.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new TZDate(), 5), {
						addSuffix: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet eventsList()}
	<ion-list inset class="mt-0 pt-0">
		<ion-list-header>{$t('routes.organization.page.event-list.list.header')}</ion-list-header>
		{#if isManager}
			<LabeledItem
				label={$t('routes.organization.page.event-list.list.create-event')}
				icon={flashOutline}
				clicked={async () => {
					await goto(resolve('/organization/activities'));
					triggerClickByLabel($t('routes.organization.page.event-list.list.create-event'));
				}}
			/>
		{/if}
		<LabeledItem
			label={$t('routes.organization.page.event-list.list.manage-events')}
			icon={calendarClearOutline}
			indexed="/organization/activities"
			clicked={() => goto(resolve('/organization/activities'))}
		/>
	</ion-list>
{/snippet}

{#snippet collectiveName(model: OrganizationTO)}
	<div class="flex items-center justify-center gap-4 text-2xl">
		<ion-text class="font-bold">{model.name}</ion-text>
		{#if $organizations.length > 1}
			<Button fill="outline" clicked={onOrganizationSelect} icon={swapHorizontalOutline} />
		{/if}
	</div>
{/snippet}

{#snippet collectiveInfo()}
	<Card
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

{#snippet generalList()}
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
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline} class="text-xl"></ion-icon>
				<ion-text class="text-lg font-bold">
					{$t('routes.organization.page.budget-card.card.collective-balance')}
				</ion-text>
			</div>
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
				expand="block"
				label={$t('routes.organization.page.budget-card.card.add-posting')}
				color="primary"
				icon={cashOutline}
				clicked={onOpenCreatePosting}
			/>
			<Button
				icon={listOutline}
				expand="block"
				fill="outline"
				label={$t('routes.organization.page.budget-card.card.postings-history')}
				clicked={() => (postingsHistoryModalOpen = true)}
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
		<div class="ms-1 mt-1 flex w-full flex-col justify-center" style="padding-left: 0px !important;">
			<div class="flex gap-2">
				<ion-text class="truncate">
					{posting.purpose}
				</ion-text>
				{#if isActivityPosting(posting.id)}
					<ion-text color="medium" class="flex items-center justify-center gap-1">
						<ion-icon icon={flashOutline}></ion-icon>
						<div class="truncate">
							{getActivityPosting(posting.id)?.name}
						</div>
					</ion-text>
				{/if}
			</div>
			<div class="flex w-full flex-wrap items-start justify-between gap-1 text-sm">
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={calendarClearOutline}></ion-icon>
					<div>{format(new TZDate(posting.date), 'PP')}</div>
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={cashOutline}></ion-icon>
					<div>
						{posting.type === 'CREDIT' ? '+' : '-'}{formatter.currency(posting.amountInCents)}
					</div>
				</ion-text>
			</div>
			{#if posting.personOfOrganizationId > 0}
				<ion-text color="medium" class="ms-2 flex items-center justify-start gap-1 text-sm">
					<ion-icon icon={personOutline}></ion-icon>
					<div>{getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)}</div>
				</ion-text>
			{/if}
		</div>
	</CustomItem>
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
		</form>
	</Card>
</Modal>

<!-- Update Posting Modal -->
<Modal open={postingUpdateModalOpen} dismissed={() => (postingUpdateModalOpen = false)}>
	<Card title={$t('routes.organization.page.modal.update-posting.card.title')}>
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.modal.update-posting.card.credit')}
					clicked={() => setSelectedPostingType('CREDIT', updatePostingForm.model, updatePostingFormActions)}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.modal.update-posting.card.debit')}
					clicked={() => setSelectedPostingType('DEBIT', updatePostingForm.model, updatePostingFormActions)}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.page.modal.update-posting.card.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem name="amountInCents" label={$t('routes.organization.page.modal.update-posting.card.amount')} />
			<DatetimeInputItem name="date" label={$t('routes.organization.page.modal.update-posting.card.date')} />
			<MultiSelectItem
				hidden={!isManager || !isAssignedToPersonOfOrganization}
				name="personOfOrganizationId"
				icon={peopleOutline}
				multiple={false}
				label={$t('routes.organization.page.modal.update-posting.card.person-of-organization.select')}
				noneSelectedText={$t('routes.organization.page.modal.update-posting.card.person-of-organization.none-selected')}
				items={personOfOrganizationUpdateItems}
			/>
			<MultiSelectItem
				readonly
				name="activityId"
				allSelectedText={$t('routes.organization.page.modal.update-posting.card.activities.all-selected')}
				icon={flashOutline}
				noneSelectedText={$t('routes.organization.page.modal.update-posting.card.activities.none-selected')}
				label={$t('routes.organization.page.modal.update-posting.card.activities.select')}
				items={activitySelectItems}
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
			<div class="flex items-center justify-center gap-2">
				<ion-searchbar
					class="w-full"
					debounce={100}
					placeholder={$t('routes.organization.page.modal.postings-history.search')}
					value={postingsSearchValue}
					onionInput={onSearchPostings}
				></ion-searchbar>
				<Button icon={filterOutline} clicked={() => (postingsFilterModalOpen = true)} />
			</div>
			{#if hasNonSearchFiltersApplied}
				<div class="flex justify-center">
					<Button
						size="small"
						fill="outline"
						color="danger"
						icon={refreshOutline}
						label={$t('routes.organization.page.modal.postings-history.reset-filters')}
						clicked={resetFilter}
					/>
				</div>
			{/if}
		</div>
		{#if filteredPostings.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>
					{#if postingsSearchValue.trim() === ''}
						{$t('routes.organization.page.modal.postings-history.no-postings')}
					{:else}
						{$t('routes.organization.page.modal.postings-history.no-results', {
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

<!-- Filter Popover Modal -->
<Popover extended open={postingsFilterModalOpen} dismissed={onPostingFilterModalDismiss} lazy>
	<Card title={$t('routes.organization.page.modal.postings-filter.card.title')} classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => toggleDraftPostingTypeSelected('CREDIT')}
				color="success"
				selected={postingsFilterDraft.postingTypes.includes('CREDIT')}
				icon={trendingUpOutline}
				label={$t('routes.organization.page.modal.postings-filter.card.credit')}
			/>
			<Chip
				clicked={() => toggleDraftPostingTypeSelected('DEBIT')}
				color="danger"
				selected={postingsFilterDraft.postingTypes.includes('DEBIT')}
				icon={trendingDownOutline}
				label={$t('routes.organization.page.modal.postings-filter.card.debit')}
			/>
		</div>
		<DatetimeInputItem
			max={postingsFilterDraft.toDate}
			label={$t('routes.organization.page.modal.postings-filter.card.from')}
			value={postingsFilterDraft.fromDate}
			changed={(value) => (postingsFilterDraft = { ...postingsFilterDraft, fromDate: value })}
		/>
		<DatetimeInputItem
			min={postingsFilterDraft.fromDate}
			label={$t('routes.organization.page.modal.postings-filter.card.to')}
			value={postingsFilterDraft.toDate}
			changed={(value) => (postingsFilterDraft = { ...postingsFilterDraft, toDate: value })}
		/>
		<MultiSelectItem
			value={postingsFilterDraft.personOfOrganizationIds}
			changed={onConfirmSelectDraftPostingPersonsOfOrganization}
			allSelectedText={$t('routes.organization.page.modal.postings-filter.card.person-of-organization.all-selected')}
			icon={peopleOutline}
			label={$t('routes.organization.page.modal.postings-filter.card.person-of-organization.select')}
			searchPlaceholder={$t('routes.organization.page.modal.postings-filter.card.person-of-organization.search')}
			items={personOfOrganizationFilterItems}
		/>
		{#if $organizationStore && $organizationStore.activities.length > 0}
			<MultiSelectItem
				value={postingsFilterDraft.activityIds}
				changed={onConfirmSelectDraftPostingActivities}
				allSelectedText={$t('routes.organization.page.modal.postings-filter.card.activities.all-selected')}
				icon={albumsOutline}
				label={$t('routes.organization.page.modal.postings-filter.card.activities.select')}
				searchPlaceholder={$t('routes.organization.page.modal.postings-filter.card.activities.search')}
				items={activityFilterItems}
			/>
		{/if}
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				label={$t('routes.organization.page.modal.postings-filter.card.reset')}
				color="danger"
				icon={refreshOutline}
				fill="outline"
				clicked={resetDraftFilter}
			/>
			<Button
				label={$t('routes.organization.page.modal.postings-filter.card.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={applyDraftFilter}
			/>
		</div>
	</Card>
</Popover>
