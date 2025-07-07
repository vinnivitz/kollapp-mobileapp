<script lang="ts">
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import { actionSheetController, alertController, loadingController } from 'ionic-svelte';
	import {
		buildOutline,
		calendarClearOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
		closeOutline,
		createOutline,
		documentOutline,
		filterOutline,
		flashOutline,
		listOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		personOutline,
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
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import { t } from '$lib/locales';
	import { UserRole } from '$lib/models/api';
	import {
		type AccountPostingModel,
		AccountPostingType,
		type ActivityModel,
		type OrganizationModel
	} from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type ItemSlidingOption } from '$lib/models/ui';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		currencyFormatter,
		currencyKeyEventHandler,
		currencyParser,
		customForm,
		getDateFnsLocale,
		getValidationResult,
		hasRole,
		triggerClickByLabel
	} from '$lib/utility';

	type AccountBalance = {
		balance: string;
		income: string;
		spent: string;
	};

	type MemberFilter = {
		selected: boolean;
		username: string;
	};

	const organizations = $derived(organizationStore.organizations);
	const postings = $derived($accountPostingsStore ?? []);
	const accountBalance = $derived(calculateAccountBalance(postings ?? []));

	let createAccountPostingFormActions: FormActions<CreateAccountPostingDto>;
	let updateAccountPostingFormActions: FormActions<CreateAccountPostingDto>;

	let createAccountPostingModalOpen = $state(false);
	let updateAccountPostingModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let filteredPostings = $state<AccountPostingModel[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes: AccountPostingType[] = $state([AccountPostingType.DEBIT, AccountPostingType.CREDIT]);

	let selectedPosting = $state<AccountPostingModel | undefined>();
	let selectedPostingType = $state<AccountPostingType>(AccountPostingType.DEBIT);

	let filterOpen = $state(false);

	let fromFilterDate = $state(new Date().toISOString());
	let toFilterDate = $state(new Date().toISOString());

	let filterMembersModalOpen = $state(false);
	const members = $derived<MemberFilter[]>(
		$organizationStore?.personsOfOrganization.map((member) => ({ selected: true, username: member.username })) ?? []
	);
	let filteredMembers = $state<MemberFilter[]>([]);
	const selectedMembers = $derived(getSelectedMembers(filteredMembers));
	const membersToggleActive = $derived(
		filteredMembers.length === filteredMembers.filter((member) => member.selected).length
	);
	let membersSearchValue = $state('');

	const createAccountPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createAccountPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createAccountPostingFormActions = exposedActions),
		formatters: { amountInCents: currencyFormatter },
		keyEventHandlers: { amountInCents: currencyKeyEventHandler() },
		parsers: { amountInCents: currencyParser() },
		request: async (model) => accountingResource.addAccountPosting($organizationStore?.id!, model),
		schema: createAccountPostingSchema()
	});

	$effect(() => {
		if (postings) {
			fromFilterDate = getMinPostingDate(postings);
			toFilterDate = getMaxPostingDate(postings);
		}
	});

	$effect(() => {
		if (members) {
			filteredMembers = members;
		}
	});

	$effect(() => {
		if (selectedPostingType) {
			createAccountPostingFormActions.setModel(
				createAccountPostingSchema().cast({
					activityId: 0,
					type: selectedPostingType
				}) as CreateAccountPostingDto
			);
		}
	});

	const updateAccountPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updateAccountPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (updateAccountPostingFormActions = exposedActions),
		formatters: { amountInCents: currencyFormatter },
		keyEventHandlers: { amountInCents: currencyKeyEventHandler() },
		parsers: { amountInCents: currencyParser() },
		request: async (model) =>
			accountingResource.updateAccountPosting($organizationStore?.id!, selectedPosting?.id!, model),
		schema: createAccountPostingSchema()
	});

	$effect(() => {
		if (selectedPosting) {
			updateAccountPostingFormActions.setModel(selectedPosting);
		}
	});

	$effect(() => {
		if (postings) {
			filterPostings();
		}
	});

	function getMinPostingDate(postings: AccountPostingModel[]): string {
		return postings.length > 0
			? new Date(Math.min(...postings.map((posting) => new Date(posting.date).getTime()))).toISOString()
			: new Date().toISOString();
	}

	function getMaxPostingDate(postings: AccountPostingModel[]): string {
		return postings.length > 0
			? new Date(Math.max(...postings.map((posting) => new Date(posting.date).getTime()))).toISOString()
			: new Date().toISOString();
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
				new Date(posting.date) >= new Date(fromFilterDate) && new Date(posting.date) <= new Date(toFilterDate);
			return matchesType && matchesDateRange && (matchesPurpose || matchesActivityName || matchesUsername);
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
			balance: currencyFormatter(balance),
			income: currencyFormatter(totalIncome),
			spent: currencyFormatter(totalExpense)
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
			const result = getValidationResult(await accountingResource.deleteAccountPosting(organizationId, postingId));
			if (result.valid) {
				await accountPostingsStore.update(organizationId);
			}
		}
		await loader.dismiss();
	}

	function onOpenUpdatePostingModal(posting: AccountPostingModel): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		updateAccountPostingModalOpen = true;
	}

	function onApplyFromFilterDate(date: string): void {
		fromFilterDate = date;
		filterPostings();
	}

	function getSelectedMembers(members: MemberFilter[]): string {
		const filtered = members.filter((member) => member.selected);
		if (filtered.length === members.length) {
			return 'All members';
		} else if (filtered.length === 0) {
			return 'None selected';
		}
		return filtered.map((member) => member.username).join(', ');
	}

	function onSearchMembers(event: CustomEvent): void {
		membersSearchValue = event.detail.value;
		filteredMembers = members.filter((member) => member.username.toLowerCase().includes(membersSearchValue));
	}

	function toggleMemberSelection(value?: boolean): void {
		filteredMembers = filteredMembers.map((member) => ({ ...member, selected: value ?? false }));
	}
</script>

<Layout title={$t('routes.organization.title')}>
	{#if $organizationStore}
		{#if $organizationStore.activities.length > 0}
			{@render changeCollective($organizationStore)}
		{/if}
		{#if $organizationStore.activities.length > 0}
			{@render upcomingEvent($organizationStore.activities)}
		{/if}
		{@render budgetCard()}
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
		click={() => activities[0]?.id && goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL(activities[0].id))}
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
						includeSeconds: true,
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
			click={async () => {
				await goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
				triggerClickByLabel($t('routes.organization.page.activity.create'));
			}}
		/>
		<LabeledItem
			label={$t('routes.organization.list.organization.activity.label')}
			icon={calendarOutline}
			searchable={PageRoute.ORGANIZATION.ACTIVITIES.ROOT}
			click={() => goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
		/>
	</ion-list>
{/snippet}

{#snippet changeCollective(model: OrganizationModel)}
	<Card
		color="transparent"
		id={$t('routes.organization.change-organization.action-sheet.title')}
		icon={swapHorizontalOutline}
		click={onOrganizationSelect}
		searchable={PageRoute.ORGANIZATION.ROOT}
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
			searchable={PageRoute.ORGANIZATION.MEMBERS}
			click={() => goto(PageRoute.ORGANIZATION.MEMBERS)}
			icon={peopleOutline}
			label={$t('routes.organization.list.organization.members')}
		/>
		{#if !hasRole(UserRole.MANAGER)}
			<LabeledItem
				searchable={PageRoute.ORGANIZATION.UPDATE_DATA}
				accessible={[UserRole.MANAGER]}
				click={() => goto(PageRoute.ORGANIZATION.UPDATE_DATA)}
				icon={buildOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
		{/if}
		<LabeledItem
			searchable={PageRoute.ORGANIZATION.LEAVE}
			click={() => goto(PageRoute.ORGANIZATION.LEAVE)}
			icon={logOutOutline}
			label={$t('routes.organization.list.organization.leave.label')}
		/>
	</ion-list>
{/snippet}

{#snippet generalList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.general.title')}</ion-list-header>

		<LabeledItem
			searchable={PageRoute.ORGANIZATION.REGISTER}
			click={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			icon={createOutline}
			label={$t('routes.organization.list.general.register.label')}
		/>
		<LabeledItem
			searchable={PageRoute.ORGANIZATION.JOIN}
			click={() => goto(PageRoute.ORGANIZATION.JOIN)}
			icon={personAddOutline}
			label={$t('routes.organization.list.general.join.label')}
		/>
	</ion-list>
{/snippet}

{#snippet budgetCard()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text class="text-lg font-bold">Collective balance:</ion-text>
			</div>
			<ion-text class="text-xl font-bold">{accountBalance?.balance}</ion-text>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total incoming: {accountBalance?.income}</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total expense: {accountBalance?.spent}</ion-text>
			</div>
		</div>
		<div class="mt-3 flex items-center justify-center gap-2">
			<Button
				label="Add income"
				color="primary"
				icon={cashOutline}
				click={() => onOpenCreateAccountPosting(AccountPostingType.DEBIT)}
			/>
			<Button
				label="Add expense"
				color="tertiary"
				icon={walletOutline}
				click={() => onOpenCreateAccountPosting(AccountPostingType.CREDIT)}
			/>
		</div>
		<Button
			icon={listOutline}
			classList="mx-2"
			expand="block"
			fill="outline"
			label="Transaction history"
			click={() => (transactionHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

<Modal
	open={createAccountPostingModalOpen}
	confirm={() => createAccountPostingFormActions.onSubmit()}
	dismissed={() => (createAccountPostingModalOpen = false)}
>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createAccountPostingForm!}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === AccountPostingType.DEBIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					click={() => (selectedPostingType = AccountPostingType.DEBIT)}
				/>
				<Chip
					selected={selectedPostingType === AccountPostingType.CREDIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					click={() => (selectedPostingType = AccountPostingType.CREDIT)}
				/>
			</div>
			<InputItem name="purpose" label="Purpose" icon={documentOutline} />
			<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
				applied={(value) => createAccountPostingFormActions.onUpdate('date', value)}
			/>
		</form>
	</Card>
</Modal>

<Modal
	open={updateAccountPostingModalOpen}
	confirm={() => updateAccountPostingFormActions.onSubmit()}
	dismissed={() => (updateAccountPostingModalOpen = false)}
>
	<Card title={selectedPosting?.purpose}>
		<form use:customForm={updateAccountPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === AccountPostingType.DEBIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					click={() => (selectedPostingType = AccountPostingType.DEBIT)}
				/>
				<Chip
					selected={selectedPostingType === AccountPostingType.CREDIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					click={() => (selectedPostingType = AccountPostingType.CREDIT)}
				/>
			</div>
			<InputItem name="purpose" label="Purpose" icon={documentOutline} />
			<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
				applied={(value) => updateAccountPostingFormActions.onUpdate('date', value)}
			/>
		</form>
	</Card>
</Modal>

<Modal
	open={transactionHistoryModalOpen}
	cancelLabel="Close"
	cancelIcon={closeOutline}
	dismissed={() => (transactionHistoryModalOpen = false)}
>
	<div class="flex items-center justify-center gap-2">
		<!-- svelte-ignore event_directive_deprecated -->
		<ion-searchbar
			class="w-full"
			debounce={100}
			placeholder="Search transactions..."
			value={postingsSearchValue}
			on:ionInput={onSearchPostings}
		></ion-searchbar>
		<Button icon={filterOutline} click={() => (filterOpen = true)} />
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
</Modal>

{#key postings}
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-popover is-open={filterOpen} on:didDismiss={() => (filterOpen = false)}>
		<Card title="Filters" classList="m-0">
			<div class="flex items-center justify-center gap-2">
				<Chip
					click={() => toggleAccountPostingTypeSelected(AccountPostingType.DEBIT)}
					color="success"
					selected={selectedPostingTypes.includes(AccountPostingType.DEBIT)}
					icon={trendingUpOutline}
					label="Income"
				/>
				<Chip
					click={() => toggleAccountPostingTypeSelected(AccountPostingType.CREDIT)}
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
			<CustomItem icon={personOutline} click={() => (filterMembersModalOpen = true)}>
				<div class="flex flex-col">
					<ion-text class="ms-3 pt-2 text-xs">Select members</ion-text>
					<ion-text class="ms-4 truncate">
						{selectedMembers}
					</ion-text>
				</div>
			</CustomItem>
		</Card>
	</ion-popover>
{/key}

{#snippet transactionItem(posting: AccountPostingModel)}
	<CustomItem
		slidingOptions={getTransactionItemSlidingOptions(posting)}
		iconColor={posting.type === AccountPostingType.CREDIT ? 'danger' : 'success'}
		icon={posting.type === AccountPostingType.CREDIT ? trendingDownOutline : trendingUpOutline}
	>
		<div class="mt-1 flex w-full flex-col justify-center">
			<div class="flex gap-2">
				<ion-text class="truncate">
					{posting.purpose}
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={flashOutline}></ion-icon>
					<div class="truncate">
						{$organizationStore?.activities.find((activity) => activity.id === posting.activityId)?.name}
					</div>
				</ion-text>
			</div>
			<div class="flex w-full flex-wrap items-start justify-between gap-2 text-sm">
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
						{posting.type === AccountPostingType.CREDIT ? '-' : '+'}{currencyFormatter(posting.amountInCents)}
					</div>
				</ion-text>
			</div>
		</div>
	</CustomItem>
{/snippet}

<Modal open={filterMembersModalOpen} dismissed={() => (filterMembersModalOpen = false)} informational>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-searchbar class="w-full" debounce={100} placeholder="Search members..." on:ionInput={onSearchMembers}>
	</ion-searchbar>
	<ToggleItem
		disabled={!!membersSearchValue}
		checked={membersToggleActive}
		label="All selected"
		icon={peopleOutline}
		change={toggleMemberSelection}
	/>
	<ion-list>
		{#each filteredMembers as member (member.username)}
			<CustomItem>
				<ion-checkbox
					value={member.username}
					checked={member.selected}
					on:ionChange={() => (member.selected = !member.selected)}>{member.username}</ion-checkbox
				>
			</CustomItem>
		{/each}
	</ion-list>
</Modal>
