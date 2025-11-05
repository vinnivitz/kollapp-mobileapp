<script lang="ts">
	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, alertController, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		albumsOutline,
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

	import { type CreateAccountPostingDto, createAccountPostingSchema } from '$lib/api/dto/client/accounting';
	import { accountingResource } from '$lib/api/resources';
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
	import { OrganizationRole } from '$lib/models/api';
	import {
		type AccountPostingModel,
		AccountPostingType,
		type ActivityModel,
		type OrganizationModel
	} from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import { type FilterItem, Form, type FormActions, type ItemSlidingOption } from '$lib/models/ui';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
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

	type AccountBalance = {
		balance: string;
		income: string;
		spent: string;
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
	const postings = $derived($accountPostingsStore ?? []);
	const accountBalance = $derived(calculateAccountBalance(postings ?? []));

	let createAccountPostingFormActions = $state<FormActions<CreateAccountPostingDto>>();
	let updateAccountPostingFormActions = $state<FormActions<CreateAccountPostingDto>>();

	let createAccountPostingModalOpen = $state(false);
	let updateAccountPostingModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let updateAccountPostingModelTouched = $state(false);

	let filteredPostings = $state<AccountPostingModel[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes: AccountPostingType[] = $state([AccountPostingType.DEBIT, AccountPostingType.CREDIT]);

	let filterOpen = $state(false);

	let selectedPosting = $state<AccountPostingModel>();
	let selectedPostingType = $state<AccountPostingType>(AccountPostingType.DEBIT);

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
	let selectedActivityId = $state('0');
	let selectedActivity = $state<ActivityModel>();

	const createAccountPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createAccountPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createAccountPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: async (model) => accountingResource.add($organizationStore?.id!, model),
		schema: createAccountPostingSchema()
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

	const updateAccountPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updateAccountPostingModalOpen = false;
			updateAccountPostingModelTouched = false;
		},
		exposedActions: (exposedActions) => (updateAccountPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		onTouched: () => (updateAccountPostingModelTouched = true),
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: async (model) => accountingResource.update($organizationStore?.id!, selectedPosting?.id!, model),
		schema: createAccountPostingSchema()
	});

	$effect(() => {
		if (postings) filterPostings();
	});

	function getMinPostingDate(postings: AccountPostingModel[]): string {
		return postings.length > 0
			? new TZDate(Math.min(...postings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function getMaxPostingDate(postings: AccountPostingModel[]): string {
		return postings.length > 0
			? new TZDate(Math.max(...postings.map((posting) => new TZDate(posting.date).getTime()))).toISOString()
			: new TZDate().toISOString();
	}

	function getTransactionItemSlidingOptions(posting: AccountPostingModel): ItemSlidingOption[] {
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

	function filterPostings(): void {
		filteredPostings = postings.filter((posting) => {
			const matchesType = selectedPostingTypes.includes(posting.type);
			const matchesPurpose = posting.purpose.toLowerCase().includes(postingsSearchValue.toLowerCase());
			const matchesActivityName = $organizationStore?.activities
				.find((activity) => activity.id === posting.activityId)
				?.name.toLowerCase()
				.includes(postingsSearchValue.toLowerCase());
			const matchesUsername = $userStore?.username.toLowerCase().includes(postingsSearchValue.toLowerCase());
			const matchesDateRange =
				new TZDate(posting.date) >= new TZDate(fromFilterDate) && new TZDate(posting.date) <= new TZDate(toFilterDate);
			const matchesActivities = filteredActivityFilterItems.some(
				(activity) =>
					activity.selected &&
					(activity.data.id === posting.activityId || (activity.data.id === 0 && !posting.activityId))
			);
			return (
				matchesActivities &&
				matchesType &&
				matchesDateRange &&
				(matchesPurpose || matchesActivityName || matchesUsername)
			);
		});
	}

	function calculateAccountBalance(postings: AccountPostingModel[]): AccountBalance {
		let totalIncome = 0,
			totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === AccountPostingType.DEBIT) totalIncome += posting.amountInCents;
			else if (posting.type === AccountPostingType.CREDIT) totalExpense += posting.amountInCents;
		}
		const balance = totalIncome - totalExpense;
		return {
			balance: formatter.currency(balance, true),
			income: formatter.currency(totalIncome, true),
			spent: formatter.currency(totalExpense, true)
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

	async function onOpenCreateAccountPosting(type: AccountPostingType): Promise<void> {
		selectedPostingType = type;
		createAccountPostingFormActions?.setModel(
			createAccountPostingSchema().cast({
				activityId: 0,
				type: selectedPostingType
			}) as CreateAccountPostingDto
		);
		createAccountPostingModalOpen = true;
	}

	function getCreatePostingTitle(type: AccountPostingType): string {
		return type === AccountPostingType.DEBIT
			? $t('routes.organization.page.activity.page.slug.modal.create-posting.title.income')
			: $t('routes.organization.page.activity.page.slug.modal.create-posting.title.expense');
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
		filterPostings();
	}

	function toggleAccountPostingTypeSelected(type: AccountPostingType): void {
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
			const result = getValidationResult(await accountingResource.remove(organizationId, postingId));
			if (result.valid) {
				await accountPostingsStore.update(organizationId);
			}
		}
		await loader.dismiss();
	}

	function onOpenUpdatePostingModal(posting: AccountPostingModel): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		updateAccountPostingFormActions?.setModel(clone(selectedPosting));
		updateAccountPostingModalOpen = true;
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
		selectedPostingTypes = [AccountPostingType.DEBIT, AccountPostingType.CREDIT];
	}

	function onConfirmSelectActivity(): void {
		selectedActivity = $organizationStore?.activities.find((activity) => activity.id === +selectedActivityId);
		selectActivityModalOpen = false;
		createAccountPostingFormActions?.setModel({
			...createAccountPostingForm.model,
			activityId: +selectedActivityId
		} as CreateAccountPostingDto);
	}

	function onDismissSelectActivity(): void {
		selectActivityModalOpen = false;
		selectedActivityId = createAccountPostingForm.model.activityId.toString() ?? '0';
	}

	function onOpenSelectActivityModal(): void {
		selectedActivityId = createAccountPostingForm.model.activityId?.toString() ?? '0';
		selectActivityModalOpen = true;
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

{#snippet upcomingEvent(activities: ActivityModel[])}
	<Card
		border="secondary"
		title="Upcoming event"
		classList="mt-5"
		clicked={() => activities[0]?.id && goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL(activities[0].id))}
	>
		<div class="flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activities[0]?.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new Date(), 5), {
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
				await goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
				triggerClickByLabel($t('routes.organization.page.activity.create'));
			}}
		/>
		<LabeledItem
			label={$t('routes.organization.list.organization.activity.label')}
			icon={calendarOutline}
			indexed={PageRoute.ORGANIZATION.ACTIVITIES.ROOT}
			clicked={() => goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
		/>
	</ion-list>
{/snippet}

{#snippet changeCollective(model: OrganizationModel)}
	<Card
		color="transparent"
		id={$t('routes.organization.change-organization.action-sheet.title')}
		icon={swapHorizontalOutline}
		clicked={onOrganizationSelect}
		indexed={PageRoute.ORGANIZATION.ROOT}
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
			indexed={PageRoute.ORGANIZATION.MEMBERS}
			clicked={() => goto(PageRoute.ORGANIZATION.MEMBERS)}
			icon={peopleOutline}
			label={$t('routes.organization.list.organization.members')}
		/>
		{#if !hasOrganizationRole(OrganizationRole.MANAGER)}
			<LabeledItem
				indexed={PageRoute.ORGANIZATION.UPDATE_DATA}
				accessible={[OrganizationRole.MANAGER]}
				clicked={() => goto(PageRoute.ORGANIZATION.UPDATE_DATA)}
				icon={buildOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
		{/if}
		<LabeledItem
			indexed={PageRoute.ORGANIZATION.LEAVE}
			clicked={() => goto(PageRoute.ORGANIZATION.LEAVE)}
			icon={logOutOutline}
			label={$t('routes.organization.list.organization.leave.label')}
		/>
	</ion-list>
{/snippet}

{#snippet generalList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.general.title')}</ion-list-header>

		<LabeledItem
			indexed={PageRoute.ORGANIZATION.REGISTER}
			clicked={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			icon={createOutline}
			label={$t('routes.organization.list.general.register.label')}
		/>
		<LabeledItem
			indexed={PageRoute.ORGANIZATION.JOIN}
			clicked={() => goto(PageRoute.ORGANIZATION.JOIN)}
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
			<ion-text class="text-xl font-bold">{accountBalance?.balance}</ion-text>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="success" icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total incoming: {accountBalance?.income}</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon color="danger" icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total expense: {accountBalance?.spent}</ion-text>
			</div>
		</div>
		<div class="mt-3 flex items-center justify-center gap-2">
			<Button
				label="Add income"
				color="primary"
				icon={cashOutline}
				clicked={() => onOpenCreateAccountPosting(AccountPostingType.DEBIT)}
			/>
			<Button
				label="Add expense"
				color="tertiary"
				icon={walletOutline}
				clicked={() => onOpenCreateAccountPosting(AccountPostingType.CREDIT)}
			/>
		</div>
		<Button
			icon={listOutline}
			classList="mx-2"
			expand="block"
			fill="clear"
			label="Transaction history"
			clicked={() => (transactionHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

<Modal open={createAccountPostingModalOpen} dismissed={() => (createAccountPostingModalOpen = false)}>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createAccountPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === AccountPostingType.DEBIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => (selectedPostingType = AccountPostingType.DEBIT)}
				/>
				<Chip
					selected={selectedPostingType === AccountPostingType.CREDIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => (selectedPostingType = AccountPostingType.CREDIT)}
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

<Modal
	open={updateAccountPostingModalOpen}
	touched={updateAccountPostingModelTouched}
	dismissed={() => (updateAccountPostingModalOpen = false)}
>
	<Card title="Update transaction">
		<form use:customForm={updateAccountPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === AccountPostingType.DEBIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => (selectedPostingType = AccountPostingType.DEBIT)}
				/>
				<Chip
					selected={selectedPostingType === AccountPostingType.CREDIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => (selectedPostingType = AccountPostingType.CREDIT)}
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

<Popover extended open={filterOpen} dismissed={() => (filterOpen = false)} lazy>
	<Card title="Filters" classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => toggleAccountPostingTypeSelected(AccountPostingType.DEBIT)}
				color="success"
				selected={selectedPostingTypes.includes(AccountPostingType.DEBIT)}
				icon={trendingUpOutline}
				label="Income"
			/>
			<Chip
				clicked={() => toggleAccountPostingTypeSelected(AccountPostingType.CREDIT)}
				color="danger"
				selected={selectedPostingTypes.includes(AccountPostingType.CREDIT)}
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
			<Button label="Reset filter" color="danger" icon={refreshOutline} fill="outline" clicked={resetFilter} />
			<Button label="Apply filter" icon={saveOutline} fill="outline" clicked={() => (filterOpen = false)} />
		</div>
	</Card>
</Popover>

{#snippet transactionItem(posting: AccountPostingModel)}
	<CustomItem
		slidingOptions={getTransactionItemSlidingOptions(posting)}
		iconColor={posting.type === AccountPostingType.CREDIT ? 'danger' : 'success'}
		icon={posting.type === AccountPostingType.CREDIT ? trendingDownOutline : trendingUpOutline}
	>
		<div class="ms-1 mt-1 flex w-full flex-col justify-center" style="padding-left: 0px !important;">
			<div class="flex gap-2">
				<ion-text class="truncate">
					{posting.purpose}
				</ion-text>
				{#if posting.activityId}
					<ion-text color="medium" class="flex items-center justify-center gap-1">
						<ion-icon icon={flashOutline}></ion-icon>
						<div class="truncate">
							{$organizationStore?.activities.find((activity) => activity.id === posting.activityId)?.name}
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
					<div>{format(new Date(posting.date), 'PPP')}</div>
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={cashOutline}></ion-icon>
					<div>
						{posting.type === AccountPostingType.CREDIT ? '-' : '+'}{formatter.currency(posting.amountInCents)}
					</div>
				</ion-text>
			</div>
		</div>
	</CustomItem>
{/snippet}

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
		{#each filteredActivityFilterItems as activity (activity.data.id)}
			<CustomItem>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<ion-radio
					value={activity.data.id.toString()}
					onclick={() => (selectedActivityId = activity.data.id.toString())}
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
