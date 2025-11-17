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
	import { CalendarPermissionScope, CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { alertController, isPlatform, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		addOutline,
		archiveOutline,
		calendarClearOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		filterOutline,
		listOutline,
		locationOutline,
		mapOutline,
		peopleOutline,
		personOutline,
		refreshOutline,
		saveOutline,
		trashBinOutline,
		trashOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { activityResource, budgetResource } from '$lib/api/resources';
	import { createPostingSchema } from '$lib/api/validation/budget';
	import { updateActivitySchema } from '$lib/api/validation/organization';
	import Layout from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import { t } from '$lib/locales';
	import {
		type FabButtonButtons,
		type FilterItem,
		Form,
		type FormActions,
		type ItemSlidingOption
	} from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		clone,
		customForm,
		featureNotImplementedAlert,
		formatter,
		getDateFnsLocale,
		getValidationResult,
		parser,
		showAlert
	} from '$lib/utility';

	type AccountBalance = {
		balance: string;
		income: string;
		spent: string;
	};

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));
	const postings = $derived($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? []);

	const accountBalance = $derived(calculateAccountBalance(postings ?? []));

	const activityEventButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: 'Delete event'
		},
		{ color: 'tertiary', handler: featureNotImplementedAlert, icon: archiveOutline, label: 'Archieve event' },
		{ color: 'primary', handler: onOpenActivityModal, icon: createOutline, label: 'Edit event' }
	];

	let createAccountPostingFormActions: FormActions<PostingCreateUpdateRequestTO>;
	let updateAccountPostingFormActions: FormActions<PostingCreateUpdateRequestTO>;
	let updateActivityFormActions: FormActions<ActivityUpdateRequestTO>;

	let createAccountPostingModalOpen = $state(false);
	let updateAccountPostingModalOpen = $state(false);
	let updateActivityModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let updateAccountPostingModelTouched = $state(false);
	let updateActivityModelTouched = $state(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes: PostingType[] = $state(['DEBIT', 'CREDIT']);

	let filterOpen = $state(false);

	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');

	let fromFilterDate = $state(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state(format(new TZDate(), 'yyyy-MM-dd'));

	let filterMembersModalOpen = $state(false);
	const memberFilterItems = $derived<FilterItem[]>(
		$organizationStore?.personsOfOrganization.map((member) => ({ data: member.username, selected: true })) ?? []
	);
	let filteredMemberFilterItems = $state<FilterItem[]>([]);
	const displayedFilteredMembers = $derived(getDisplayedFilteredMembers(filteredMemberFilterItems));
	const allMemberFilterItemsToggleActive = $derived(
		filteredMemberFilterItems.length === filteredMemberFilterItems.filter((member) => member.selected).length
	);

	const createAccountPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createAccountPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createAccountPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: (model) => budgetResource.createActivityPosting($organizationStore?.id!, activity?.id!, model),
		schema: createPostingSchema()
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
		request: async (model) =>
			budgetResource.updateActivityPosting($organizationStore?.id!, activity?.id!, selectedPosting?.id!, model),
		schema: createPostingSchema()
	});

	const updateActivityForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			updateActivityModalOpen = false;
			updateActivityModelTouched = false;
		},
		exposedActions: (actions) => (updateActivityFormActions = actions),
		onTouched: () => (updateActivityModelTouched = true),
		request: async (model) => await activityResource.update($organizationStore?.id!, activity?.id!, model),
		schema: updateActivitySchema()
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
		if (postings) filterPostings();
	});

	$effect(() => {
		if ($organizationStore && !activity) goto(resolve('/organization/activities'));
	});

	function onSearchMembers(event: CustomEvent): void {
		const value = event.detail.value;
		filteredMemberFilterItems = memberFilterItems.filter((member) => member.data.toLowerCase().includes(value));
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
			return matchesType && matchesDateRange && (matchesPurpose || matchesActivityName || matchesUsername);
		});
	}

	function getDisplayedFilteredMembers(members: FilterItem[]): string {
		const filtered = members.filter((member) => member.selected);
		if (filtered.length === members.length) {
			return 'All members';
		} else if (filtered.length === 0) {
			return 'None selected';
		}
		return filtered.map((member) => member.data).join(', ');
	}

	async function onDeleteActivity(): Promise<void> {
		const alert = await alertController.create({
			buttons: [
				{ role: 'cancel', text: 'Cancel' },
				{ handler: deleteActivity, text: 'Delete event' }
			],
			header: `Are you sure?`,
			message: `This action cannot be undone.`
		});
		await alert.present();
	}

	async function deleteActivity(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		await activityResource.remove($organizationStore?.id!, activity?.id!);
		await organizationStore.update($organizationStore?.id!);
		updateActivityModalOpen = false;
		await loader.dismiss();
		await goto(resolve('/organization/activities'));
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

	function onOpenActivityModal(): void {
		updateActivityFormActions.setModel(clone(activity));
		updateActivityModalOpen = true;
	}

	function calculateAccountBalance(postings: PostingTO[]): AccountBalance {
		let totalIncome = 0,
			totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === 'DEBIT') totalIncome += posting.amountInCents;
			else if (posting.type === 'CREDIT') totalExpense += posting.amountInCents;
		}
		const balance = totalIncome - totalExpense;
		return {
			balance: formatter.currency(balance, true),
			income: formatter.currency(totalIncome, true),
			spent: formatter.currency(totalExpense, true)
		};
	}

	async function onOpenCreateAccountPosting(type: PostingType): Promise<void> {
		selectedPostingType = type;
		createAccountPostingFormActions.setModel(
			createPostingSchema().cast({
				type: selectedPostingType
			} satisfies Partial<PostingCreateUpdateRequestTO>)
		);
		createAccountPostingModalOpen = true;
	}

	function getCreatePostingTitle(type: PostingType): string {
		return type === 'DEBIT'
			? $t('routes.organization.page.activity.page.slug.modal.create-posting.title.income')
			: $t('routes.organization.page.activity.page.slug.modal.create-posting.title.expense');
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
		if (!(await requestCalendarPermission()) || !activity) return;
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

	async function requestCalendarPermission(): Promise<boolean> {
		try {
			let permission = await CapacitorCalendar.checkPermission({ scope: CalendarPermissionScope.WRITE_CALENDAR });
			if (permission.result === 'granted') {
				return true;
			} else if (
				permission.result === 'prompt' ||
				permission.result === 'denied' ||
				permission.result === 'prompt-with-rationale'
			) {
				permission = await CapacitorCalendar.requestFullCalendarAccess();
				if (permission.result === 'granted') {
					return true;
				}
			}
			await showAlert($t('routes.organization.page.activity.page.slug.card.summary.add-to-calendar.permission-denied'));
			return false;
		} catch {
			await showAlert($t('routes.organization.page.activity.page.slug.card.summary.add-to-calendar.error'));
			return false;
		}
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
		filterPostings();
	}

	function toggleAccountPostingTypeSelected(type: PostingType): void {
		selectedPostingTypes = selectedPostingTypes.includes(type)
			? selectedPostingTypes.filter((_type) => _type !== type)
			: [...selectedPostingTypes, type];
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
			const result = getValidationResult(
				await budgetResource.removeActivityPosting(organizationId, activity?.id!, postingId)
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
		updateAccountPostingFormActions.setModel(clone(selectedPosting));
		updateAccountPostingModalOpen = true;
	}

	function onApplyFromFilterDate(date: string): void {
		fromFilterDate = date;
		filterPostings();
	}

	function toggleMemberFilterItemsSelection(value?: boolean): void {
		filteredMemberFilterItems = filteredMemberFilterItems.map((member) => ({ ...member, selected: value ?? false }));
	}

	function resetFilter(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		filteredMemberFilterItems = memberFilterItems;
		selectedPostingTypes = ['DEBIT', 'CREDIT'];
		filterOpen = false;
	}

	function setAccountPostingType(type: PostingType): void {
		selectedPostingType = type;
		updateAccountPostingModelTouched = true;
	}
</script>

<Layout title="Event Details" showBackButton>
	{@render eventSummary()}
	{@render activityAccountSummary()}
	{@render actionButton()}
</Layout>

<!-- Snippets -->

{#snippet eventSummary()}
	<!-- svelte-ignore attribute_quoted -->
	<Card border="secondary" title={activity?.name} classList="mb-5" clicked={onOpenActivityModal}>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<div class="flex items-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{activity?.location}</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={calendarOutline}></ion-icon>
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
			<Button icon={mapOutline} size="small" fill="solid" color="light" label="Open in map" clicked={onOpenLocation} />
			<Button
				icon={calendarOutline}
				size="small"
				fill="solid"
				color="light"
				label="Add to calendar"
				clicked={onAddToCalendar}
			/>
		</div>
	</Card>
{/snippet}

{#snippet activityAccountSummary()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline} class="text-xl"></ion-icon>
				<ion-text class="text-lg font-bold">Event balance:</ion-text>
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
				clicked={() => onOpenCreateAccountPosting('DEBIT')}
			/>
			<Button
				label="Add expense"
				color="tertiary"
				icon={walletOutline}
				clicked={() => onOpenCreateAccountPosting('CREDIT')}
			/>
		</div>
		<Button
			icon={listOutline}
			expand="block"
			fill="outline"
			label="Transaction history"
			clicked={() => (transactionHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

{#snippet actionButton()}
	<FabButton label="Event actions" icon={addOutline} buttons={activityEventButtons} />
{/snippet}

{#snippet transactionItem(posting: PostingTO)}
	<CustomItem
		slidingOptions={getTransactionItemSlidingOptions(posting)}
		iconColor={posting.type === 'CREDIT' ? 'danger' : 'success'}
		icon={posting.type === 'CREDIT' ? trendingDownOutline : trendingUpOutline}
	>
		<div class="mt-1 flex w-full flex-col justify-center">
			<ion-text class="truncate">
				{posting.purpose}
			</ion-text>
			<div class="flex w-full flex-wrap items-start justify-between text-sm">
				<ion-text color="medium" class="flex items-center justify-center gap-2">
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
						{posting.type === 'CREDIT' ? '-' : '+'}{formatter.currency(posting.amountInCents)}
					</div>
				</ion-text>
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
	confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
>
	<Card title={$t('routes.organization.page.activity.edit-modal.card.title')}>
		<form use:customForm={updateActivityForm}>
			<TextInputItem
				name="name"
				label={$t('routes.organization.page.activity.create-modal.card.input.name')}
				icon={documentOutline}
			/>
			<LocationInputItem
				label={$t('routes.organization.page.activity.update-modal.card.input.location')}
				name="location"
			/>
			<DatetimeInputItem label="Date" name="date" />
		</form>
	</Card>
</Modal>

<!-- Create Account Posting Modal -->
<Modal open={createAccountPostingModalOpen} dismissed={() => (createAccountPostingModalOpen = false)}>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createAccountPostingForm!}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => (selectedPostingType = 'DEBIT')}
				/>
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => (selectedPostingType = 'CREDIT')}
				/>
			</div>
			<TextInputItem name="purpose" label="Purpose" icon={documentOutline} />
			<AmountInputItem name="amountInCents" label="Amount" />
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
				name="date"
			/>
		</form>
	</Card>
</Modal>

<!-- Update Account Posting Modal -->
<Modal
	open={updateAccountPostingModalOpen}
	dismissed={() => (updateAccountPostingModalOpen = false)}
	touched={updateAccountPostingModelTouched}
>
	<Card title="Update transaction">
		<form use:customForm={updateAccountPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => setAccountPostingType('DEBIT')}
				/>
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => setAccountPostingType('CREDIT')}
				/>
			</div>
			<TextInputItem name="purpose" label="Purpose" icon={documentOutline} />
			<AmountInputItem name="amountInCents" label="Amount" />
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
				name="date"
			/>
		</form>
	</Card>
</Modal>

<!-- Transaction History Modal -->
<Modal
	initialBreakPoint={0.75}
	open={transactionHistoryModalOpen}
	dismissed={() => (transactionHistoryModalOpen = false)}
	informational
	lazy
>
	<div class="flex items-center justify-center gap-2">
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
			<div class="mb-2">
				<ion-note>No transactions found.</ion-note>
			</div>
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
</Modal>

<!-- Activity Filters Popover Modal -->
<Popover extended open={filterOpen} dismissed={() => (filterOpen = false)}>
	<Card title="Filters" classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => toggleAccountPostingTypeSelected('DEBIT')}
				color="success"
				selected={selectedPostingTypes.includes('DEBIT')}
				icon={trendingUpOutline}
				label="Income"
			/>
			<Chip
				clicked={() => toggleAccountPostingTypeSelected('CREDIT')}
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
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button label="Reset" color="danger" icon={refreshOutline} fill="outline" clicked={resetFilter} />
			<Button label="Apply" icon={saveOutline} fill="outline" clicked={() => (filterOpen = false)} />
		</div>
	</Card>
</Popover>

<!-- Filter Members Modal -->
<Modal open={filterMembersModalOpen} dismissed={() => (filterMembersModalOpen = false)} informational>
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
					value={member.data}
					checked={member.selected}
					onionChange={() => (member.selected = !member.selected)}>{member.data}</ion-checkbox
				>
			</CustomItem>
		{/each}
	</ion-list>
</Modal>
