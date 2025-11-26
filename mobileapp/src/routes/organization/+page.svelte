<script lang="ts">
	import type {
		ActivityTO,
		OrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, alertController, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		albumsOutline,
		arrowForwardOutline,
		buildOutline,
		calendarClearOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
		checkmark,
		createOutline,
		documentOutline,
		filterOutline,
		flashOffOutline,
		flashOutline,
		listOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		personOutline,
		refreshOutline,
		saveOutline,
		swapHorizontalOutline,
		trashBinOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import { createPostingSchema } from '$lib/api/validation/budget';
	import Layout from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import { t } from '$lib/locales';
	import { type FilterItem, Form, type FormActions, type ItemSlidingOption } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		clone,
		customForm,
		formatter,
		getDateFnsLocale,
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

	type ActivityFilterValue = {
		id: number;
		name: string;
		icon?: string;
	};

	type MemberFilterValue = {
		id: number;
		username: string;
	};

	const organizations = $derived(organizationStore.organizations);
	const postings = $derived([
		...($organizationStore?.organizationPostings ?? []),
		...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
	]);
	const balance = $derived(calculateBalance(postings ?? []));

	let createPostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();
	let updatePostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();

	let createPostingModalOpen = $state(false);
	let updatePostingModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let updatePostingModelTouched = $state(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes = $state<PostingType[]>(['DEBIT', 'CREDIT']);

	let filterOpen = $state(false);

	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');

	let fromFilterDate = $state(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state(format(new TZDate(), 'yyyy-MM-dd'));

	let filterMembersModalOpen = $state(false);
	let filterActivitiesModalOpen = $state(false);
	const memberFilterItems = $derived<FilterItem<MemberFilterValue>[]>(
		$organizationStore?.personsOfOrganization.map((member) => ({
			data: { id: member.userId, username: member.username },
			selected: true
		})) ?? []
	);
	const activityFilterItems = $derived<FilterItem<ActivityFilterValue>[]>([
		...($organizationStore?.activities.map((activity) => ({
			data: { id: activity.id, name: activity.name },
			selected: true
		})) ?? []),
		{ data: { icon: flashOffOutline, id: 0, name: 'Not assigned to activity' }, selected: true }
	]);
	let filteredMemberFilterItems = $state<FilterItem<MemberFilterValue>[]>([]);
	let filteredActivityFilterItems = $state<FilterItem<ActivityFilterValue>[]>([]);
	const displayedFilteredMembers = $derived(getDisplayedFilteredMembers(filteredMemberFilterItems));
	const displayedFilteredActivities = $derived(getDisplayedFilteredActivities(filteredActivityFilterItems));
	const allMemberFilterItemsToggleActive = $derived(
		filteredMemberFilterItems.length === filteredMemberFilterItems.filter((member) => member.selected).length
	);
	const allActivityFilterItemsToggleActive = $derived(
		filteredActivityFilterItems.length === filteredActivityFilterItems.filter((activity) => activity.selected).length
	);

	let selectActivityModalOpen = $state(false);
	let selectedActivityId = $state<number>(0);
	let selectedActivity = $state<ActivityTO>();

	const createPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: async (model) => {
			return selectedActivityId > 0
				? budgetService.createActivityPosting($organizationStore?.id!, selectedActivityId, model)
				: budgetService.createOrganizationPosting($organizationStore?.id!, model);
		},
		schema: createPostingSchema()
	});

	const updatePostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updatePostingModalOpen = false;
			updatePostingModelTouched = false;
		},
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		onTouched: () => (updatePostingModelTouched = true),
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: async (model) =>
			budgetService.updateOrganizationPosting($organizationStore?.id!, selectedPosting?.id!, model),
		schema: createPostingSchema()
	});

	$effect(() => {
		if (postings) {
			fromFilterDate = getMinPostingDate(postings);
			toFilterDate = getMaxPostingDate(postings);
		}
	});

	$effect(() => {
		if (memberFilterItems) filteredMemberFilterItems = memberFilterItems;
	});

	$effect(() => {
		if (activityFilterItems) filteredActivityFilterItems = activityFilterItems;
	});

	$effect(() => {
		if (postings) filterPostings();
	});

	function isActivityPosting(postingId: number): boolean {
		return (
			$organizationStore?.activities.some((activity) =>
				activity.activityPostings.some((activityPosting) => activityPosting.id === postingId)
			) ?? false
		);
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

	function getTransactionItemSlidingOptions(posting: PostingTO): ItemSlidingOption[] {
		return [
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
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		updatePostingFormActions?.setModel({
			...updatePostingForm.model,
			type: selectedPostingType
		});
		updatePostingModelTouched = true;
	}

	function filterPostings(): void {
		filteredPostings = postings.filter((posting) => {
			const matchesType = selectedPostingTypes.includes(posting.type);
			const matchesPurpose = posting.purpose.toLowerCase().includes(postingsSearchValue.toLowerCase());
			const matchesActivityName = $organizationStore?.activities
				.find((activity) => activity.activityPostings.some((activityPosting) => activityPosting.id === posting.id))
				?.name.toLowerCase()
				.includes(postingsSearchValue.toLowerCase());
			const matchesUsername = $userStore?.username.toLowerCase().includes(postingsSearchValue.toLowerCase());
			const matchesDateRange =
				new TZDate(posting.date) >= new TZDate(fromFilterDate) && new TZDate(posting.date) <= new TZDate(toFilterDate);
			const matchesActivities = filteredActivityFilterItems.some(
				(activityFilterItem) =>
					activityFilterItem.selected &&
					($organizationStore?.activities
						.find((activity) => activity.id === activityFilterItem.data.id)
						?.activityPostings.some((activityPosting) => activityPosting.id === posting.id) ||
						$organizationStore?.organizationPostings.some(
							(organizationPosting) => organizationPosting.id === posting.id
						))
			);
			return (
				matchesActivities &&
				matchesType &&
				matchesDateRange &&
				(matchesPurpose || matchesActivityName || matchesUsername)
			);
		});
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
			balance: formatter.currency(balance, true),
			credit: formatter.currency(totalIncome, true),
			debit: formatter.currency(totalExpense, true)
		};
	}

	async function onOrganizationSelect(): Promise<void> {
		if ($organizations.length <= 1) return;

		const actionSheet = await actionSheetController.create({
			buttons: $organizations.map((organization) => ({
				handler: () => organizationStore.update(organization.id),
				role: $organizationStore?.id === organization.id ? 'selected' : undefined,
				text: organization.name
			})),
			header: $t('routes.organization.change-organization.action-sheet.title')
		});

		await actionSheet.present();
	}

	async function onOpenCreatePosting(type: PostingType): Promise<void> {
		selectedPostingType = type;
		createPostingFormActions?.setModel(
			createPostingSchema().cast({
				type: selectedPostingType
			} satisfies Partial<PostingCreateUpdateRequestTO>)
		);
		createPostingModalOpen = true;
	}

	function getCreatePostingTitle(type: PostingType): string {
		return type === 'DEBIT'
			? $t('routes.organization.page.activity.page.slug.modal.create-posting.title.expense')
			: $t('routes.organization.page.activity.page.slug.modal.create-posting.title.income');
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
		filterPostings();
	}

	function togglePostingTypeSelected(type: PostingType): void {
		selectedPostingTypes = selectedPostingTypes.includes(type)
			? selectedPostingTypes.filter((_type) => _type !== type)
			: [...selectedPostingTypes, type];
		filterPostings();
	}

	async function onDeletePosting(postingId: number): Promise<void> {
		const alert = await alertController.create({
			buttons: [
				{ role: 'cancel', text: 'Cancel' },
				{
					handler: () => deletePosting(postingId),
					text: 'Delete transaction'
				}
			],
			header: `Are you sure?`,
			message: `This action cannot be undone.`
		});
		await alert.present();
	}

	async function deletePosting(postingId: number): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const result = getValidationResult(await budgetService.removeOrganizationPosting(organizationId, postingId));
			if (result.valid) {
				await organizationStore.update(organizationId);
			}
		}
		await loader.dismiss();
	}

	function onOpenUpdatePostingModal(posting: PostingTO): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		updatePostingFormActions?.setModel(clone(selectedPosting));
		updatePostingModalOpen = true;
	}

	function onApplyFromFilterDate(date: string): void {
		fromFilterDate = date;
		filterPostings();
	}

	function getDisplayedFilteredActivities(activities: FilterItem<{ id: number; name: string }>[]): string {
		const filtered = activities.filter((activity) => activity.selected);
		if (filtered.length === activities.length) {
			return 'All activities';
		} else if (filtered.length === 0) {
			return 'None selected';
		}
		return filtered.map((activity) => activity.data.name).join(', ');
	}

	function getDisplayedFilteredMembers(members: FilterItem<MemberFilterValue>[]): string {
		const filtered = members.filter((member) => member.selected);
		if (filtered.length === members.length) {
			return 'All members';
		} else if (filtered.length === 0) {
			return 'None selected';
		}
		return filtered.map((member) => member.data).join(', ');
	}

	function onSearchMembers(event: CustomEvent): void {
		const value = event.detail.value;
		filteredMemberFilterItems = memberFilterItems.filter((member) =>
			member.data.username.toLowerCase().includes(value)
		);
	}

	function onSearchActivities(event: CustomEvent): void {
		const value = event.detail.value;
		filteredActivityFilterItems = activityFilterItems.filter(
			(activity) => activity.data.id !== 0 && activity.data.name.toLowerCase().includes(value)
		);
		if (!value) {
			filteredActivityFilterItems = activityFilterItems;
		}
	}

	function toggleMemberFilterItemsSelection(value?: boolean): void {
		filteredMemberFilterItems = filteredMemberFilterItems.map((member) => ({ ...member, selected: value ?? false }));
	}

	function toggleActivityFiterItemsSelection(value?: boolean): void {
		filteredActivityFilterItems = filteredActivityFilterItems.map((activity) => ({
			...activity,
			selected: value ?? false
		}));
	}

	function resetFilter(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		filteredMemberFilterItems = memberFilterItems;
		filteredActivityFilterItems = activityFilterItems;
		selectedPostingTypes = ['DEBIT', 'CREDIT'];
		filterOpen = false;
	}

	function onConfirmSelectActivity(): void {
		selectedActivity = $organizationStore?.activities.find((activity) => activity.id === selectedActivityId);
		selectActivityModalOpen = false;
		createPostingFormActions?.setModel({
			...createPostingForm.model
		} as PostingCreateUpdateRequestTO);
	}

	function onDismissSelectActivity(): void {
		selectActivityModalOpen = false;
		selectedActivityId = selectedActivity?.id ?? 0;
	}

	function onOpenSelectActivityModal(): void {
		selectedActivityId = selectedActivity?.id ?? 0;
		selectActivityModalOpen = true;
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return $organizationStore?.activities.find((activity) =>
			activity.activityPostings.some((activityPosting) => activityPosting.id === postingId)
		);
	}
</script>

<Layout title={$t('routes.organization.title')}>
	{#if $organizationStore}
		{#if $organizationStore.activities.length > 0}
			{@render changeCollective($organizationStore)}
		{/if}
		{@render budgetCard()}
		{#if $organizationStore.activities.length > 0}
			{@render upcomingEvent($organizationStore.activities)}
		{/if}
		{@render eventsList()}
		{@render collectiveList()}
	{/if}
	{@render generalList()}
</Layout>

{#snippet upcomingEvent(activities: ActivityTO[])}
	<Card
		border="secondary"
		title="Upcoming event"
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
				<ion-icon icon={calendarOutline}></ion-icon>
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
		<ion-list-header>Events</ion-list-header>
		<LabeledItem
			label={$t('routes.organization.list.activities.create-activity')}
			icon={flashOutline}
			clicked={async () => {
				await goto(resolve('/organization/activities'));
				triggerClickByLabel($t('routes.organization.page.activity.create'));
			}}
		/>
		<LabeledItem
			label={$t('routes.organization.list.organization.activity.label')}
			icon={calendarOutline}
			indexed="/organization/activities"
			clicked={() => goto(resolve('/organization/activities'))}
		/>
	</ion-list>
{/snippet}

{#snippet changeCollective(model: OrganizationTO)}
	<Card
		color="transparent"
		id={$t('routes.organization.change-organization.action-sheet.title')}
		icon={swapHorizontalOutline}
		clicked={onOrganizationSelect}
		indexed="/organization"
		readonly={$organizations.length === 1}
	>
		<div class="flex items-center justify-center gap-4 text-2xl">
			<ion-text color="dark">{model.name}</ion-text>
			{#if $organizations.length > 1}
				<ion-icon color="secondary" icon={swapHorizontalOutline}></ion-icon>
			{/if}
		</div>
	</Card>
{/snippet}

{#snippet collectiveList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.current-collective.title')}</ion-list-header>
		<LabeledItem
			indexed="/organization/members"
			clicked={() => goto(resolve('/organization/members'))}
			icon={peopleOutline}
			label={$t('routes.organization.list.organization.members')}
		/>
		{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
			<LabeledItem
				indexed="/organization/update-data"
				accessible="ROLE_ORGANIZATION_MANAGER"
				clicked={() => goto(resolve('/organization/update-data'))}
				icon={buildOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
		{/if}
		<LabeledItem
			indexed="/organization/leave"
			clicked={() => goto(resolve('/organization/leave'))}
			icon={logOutOutline}
			label={$t('routes.organization.list.organization.leave.label')}
		/>
	</ion-list>
{/snippet}

{#snippet generalList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.general.title')}</ion-list-header>

		<LabeledItem
			indexed="/organization/register"
			clicked={() => goto(resolve('/organization/register'))}
			icon={createOutline}
			label={$t('routes.organization.list.general.register.label')}
		/>
		<LabeledItem
			indexed="/organization/join"
			clicked={() => goto(resolve('/organization/join'))}
			icon={personAddOutline}
			label={$t('routes.organization.list.general.join.label')}
		/>
	</ion-list>
{/snippet}

{#snippet budgetCard()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline} class="text-xl"></ion-icon>
				<ion-text class="text-lg font-bold">Collective balance:</ion-text>
			</div>
			<ion-text class="text-xl font-bold">{balance?.balance}</ion-text>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="success" icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total incoming: {balance?.credit}</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="danger" icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total expense: {balance?.debit}</ion-text>
			</div>
		</div>
		<div class="mt-3 flex items-center justify-center gap-2">
			<Button label="Add income" color="primary" icon={cashOutline} clicked={() => onOpenCreatePosting('CREDIT')} />
			<Button label="Add expense" color="tertiary" icon={walletOutline} clicked={() => onOpenCreatePosting('DEBIT')} />
		</div>
		<Button
			icon={listOutline}
			classList="mx-2"
			expand="block"
			fill="outline"
			label="Transaction history"
			clicked={() => (transactionHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

{#snippet transactionItem(posting: PostingTO)}
	<CustomItem
		slidingOptions={getTransactionItemSlidingOptions(posting)}
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
					<ion-icon icon={personOutline}></ion-icon>
					<div class="truncate">{$userStore?.username}</div>
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={calendarClearOutline}></ion-icon>
					<div>{format(new TZDate(posting.date), 'PPP')}</div>
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={cashOutline}></ion-icon>
					<div>
						{posting.type === 'CREDIT' ? '+' : '-'}{formatter.currency(posting.amountInCents)}
					</div>
				</ion-text>
			</div>
		</div>
	</CustomItem>
{/snippet}

<!-- Modals -->

<!-- Create Posting Modal -->
<Modal open={createPostingModalOpen} dismissed={() => (createPostingModalOpen = false)}>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
			</div>
			<TextInputItem name="purpose" label="Purpose" icon={documentOutline} />
			<AmountInputItem name="amountInCents" label="Amount" />
			<DatetimeInputItem
				name="date"
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
			/>
			{#if $organizationStore && $organizationStore.activities.length > 0}
				<CustomItem icon={flashOutline} clicked={onOpenSelectActivityModal}>
					<div class="flex flex-col">
						<ion-text class="ms-3 pt-2 text-xs">Select event</ion-text>
						<ion-text class="my-2 ms-4 truncate">
							{selectedActivity ? selectedActivity.name : 'Not assigned to event'}
						</ion-text>
					</div>
				</CustomItem>
			{/if}
		</form>
	</Card>
</Modal>

<!-- Select Activity Modal -->
<Modal
	open={updatePostingModalOpen}
	touched={updatePostingModelTouched}
	dismissed={() => (updatePostingModalOpen = false)}
>
	<Card title="Update transaction">
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
			</div>
			<TextInputItem name="purpose" label="Purpose" icon={documentOutline} />
			<AmountInputItem name="amountInCents" label="Amount" />
			<DatetimeInputItem
				name="date"
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
			/>
			{#if $organizationStore && $organizationStore.activities.length > 0}
				<CustomItem icon={flashOutline} clicked={onOpenSelectActivityModal}>
					<div class="flex flex-col">
						<ion-text class="ms-3 pt-2 text-xs">Select event</ion-text>
						<ion-text class="my-2 ms-4 truncate">
							{selectedActivity ? selectedActivity.name : 'Not assigned to event'}
						</ion-text>
					</div>
				</CustomItem>
			{/if}
		</form>
	</Card>
</Modal>

<!-- Transaction History Modal -->
<Modal
	open={transactionHistoryModalOpen}
	initialBreakPoint={0.75}
	dismissed={() => (transactionHistoryModalOpen = false)}
	informational
	lazy
>
	{#if transactionHistoryModalOpen}
		<div class="relative">
			<div class="sticky top-0 left-0 z-10 flex items-center justify-center gap-2">
				<ion-searchbar
					class="w-full"
					debounce={100}
					placeholder="Search transactions..."
					value={postingsSearchValue}
					onionInput={onSearchPostings}
				></ion-searchbar>
				<Button icon={filterOutline} clicked={() => (filterOpen = true)} />
			</div>
			{#if filteredPostings.length === 0}
				<div class="mt-3 text-center">
					<ion-note>No transactions found.</ion-note>
					{#if postings.length > 0}
						<Button icon={refreshOutline} label="Reset filters" clicked={resetFilter} />
					{/if}
				</div>
			{:else}
				<ion-list>
					{#each filteredPostings as posting (posting.id)}
						{@render transactionItem(posting)}
					{/each}
				</ion-list>
			{/if}
		</div>
	{/if}
</Modal>

<!-- Filter Popover Modal -->
<Popover extended open={filterOpen} dismissed={() => (filterOpen = false)} lazy>
	<Card title="Filters" classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => togglePostingTypeSelected('DEBIT')}
				color="success"
				selected={selectedPostingTypes.includes('DEBIT')}
				icon={trendingUpOutline}
				label="Income"
			/>
			<Chip
				clicked={() => togglePostingTypeSelected('CREDIT')}
				color="danger"
				selected={selectedPostingTypes.includes('CREDIT')}
				icon={trendingDownOutline}
				label="Expense"
			/>
		</div>
		<DatetimeInputItem max={toFilterDate} label="From" value={fromFilterDate} applied={onApplyFromFilterDate} />
		<DatetimeInputItem
			min={fromFilterDate}
			label="To"
			value={toFilterDate}
			applied={(value) => (toFilterDate = value)}
		/>
		<CustomItem icon={personOutline} clicked={() => (filterMembersModalOpen = true)}>
			<div class="flex flex-col">
				<ion-text class="ms-3 pt-2 text-xs">Select members</ion-text>
				<ion-text class="my-2 ms-4 truncate">
					{displayedFilteredMembers}
				</ion-text>
			</div>
		</CustomItem>
		{#if $organizationStore && $organizationStore.activities.length > 0}
			<CustomItem icon={flashOutline} clicked={() => (filterActivitiesModalOpen = true)}>
				<div class="flex flex-col">
					<ion-text class="ms-3 pt-2 text-xs">Select events</ion-text>
					<ion-text class="my-2 ms-4 truncate">
						{displayedFilteredActivities}
					</ion-text>
				</div>
			</CustomItem>
		{/if}
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button label="Reset" color="danger" icon={refreshOutline} fill="outline" clicked={resetFilter} />
			<Button label="Apply" icon={saveOutline} fill="outline" clicked={() => (filterOpen = false)} />
		</div>
	</Card>
</Popover>

<!-- Filter Members Modal -->
<Modal open={filterMembersModalOpen} dismissed={() => (filterMembersModalOpen = false)} informational lazy>
	<ion-searchbar class="w-full" debounce={100} placeholder="Search members..." onionInput={onSearchMembers}>
	</ion-searchbar>
	<ToggleItem
		disabled={memberFilterItems.length !== filteredMemberFilterItems.length}
		checked={allMemberFilterItemsToggleActive}
		label="All selected"
		icon={peopleOutline}
		change={toggleMemberFilterItemsSelection}
	/>
	<ion-list>
		{#each filteredMemberFilterItems as member (member.data)}
			<CustomItem>
				<ion-checkbox
					value={member.data.username}
					checked={member.selected}
					onionChange={() => (member.selected = !member.selected)}>{member.data.username}</ion-checkbox
				>
			</CustomItem>
		{/each}
	</ion-list>
</Modal>

<!-- Filter Activities Modal -->
<Modal open={filterActivitiesModalOpen} dismissed={() => (filterActivitiesModalOpen = false)} informational lazy>
	<ion-searchbar class="w-full" debounce={100} placeholder="Search activities..." onionInput={onSearchActivities}>
	</ion-searchbar>
	<ToggleItem
		disabled={activityFilterItems.length !== filteredActivityFilterItems.length}
		checked={allActivityFilterItemsToggleActive}
		label="All selected"
		icon={albumsOutline}
		change={toggleActivityFiterItemsSelection}
	/>
	<ion-list>
		{#each filteredActivityFilterItems as activity (activity.data.id)}
			<CustomItem>
				<ion-checkbox
					value={activity.data.name}
					checked={activity.selected}
					onionChange={() => (activity.selected = !activity.selected)}
					color={activity.data.icon ? 'tertiary' : 'primary'}
				>
					<div class="flex items-center justify-center gap-2">
						{#if activity.data.icon}
							<ion-icon color="tertiary" icon={activity.data.icon}></ion-icon>
						{/if}
						<ion-text color={activity.data.icon ? 'tertiary' : 'dark'}>
							{activity.data.name}
						</ion-text>
					</div>
				</ion-checkbox>
			</CustomItem>
		{/each}
	</ion-list>
</Modal>

<!-- Select Activity Modal -->
<Modal
	open={selectActivityModalOpen}
	title="Select Event"
	confirmLabel="Select"
	confirmIcon={checkmark}
	confirmed={onConfirmSelectActivity}
	dismissed={onDismissSelectActivity}
	lazy
>
	<ion-searchbar class="w-full" debounce={100} placeholder="Search activities..." onionInput={onSearchActivities}>
	</ion-searchbar>
	<ion-radio-group value={selectedActivityId}>
		{console.log('selected activity id:', selectedActivityId)}
		{#each filteredActivityFilterItems as activity (activity.data.id)}
			<CustomItem>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<ion-radio
					value={activity.data.id}
					onclick={() => (selectedActivityId = activity.data.id)}
					color={activity.data.icon ? 'tertiary' : 'primary'}
				>
					<div class="flex items-center justify-center gap-2">
						{#if activity.data.icon}
							<ion-icon color="tertiary" icon={activity.data.icon}></ion-icon>
						{/if}
						<ion-text color={activity.data.icon ? 'tertiary' : 'dark'}>
							{activity.data.name}
						</ion-text>
					</div>
				</ion-radio>
			</CustomItem>
		{/each}
	</ion-radio-group>
</Modal>
