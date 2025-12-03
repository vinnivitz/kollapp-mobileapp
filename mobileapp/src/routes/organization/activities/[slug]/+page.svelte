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
	import { isPlatform, loadingController } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import {
		addOutline,
		archiveOutline,
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

	import { activityService, budgetService } from '$lib/api/services';
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
		featureNotImplementedAlert,
		formatter,
		getDateFnsLocale,
		getValidationResult,
		parser,
		showAlert
	} from '$lib/utility';

	type PostingBalance = {
		balance: string;
		credit: string;
		debit: string;
	};

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));
	const postings = $derived($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? []);

	const postingBalance = $derived(calculateBalance(postings ?? []));

	const activityEventButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: $t('routes.organization.activities.slug.page.fab.delete')
		},
		{
			color: 'tertiary',
			handler: featureNotImplementedAlert,
			icon: archiveOutline,
			label: $t('routes.organization.activities.slug.page.fab.archieve')
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
	let transactionHistoryModalOpen = $state<boolean>(false);

	let updatePostingModelTouched = $state<boolean>(false);
	let updateActivityModelTouched = $state<boolean>(false);

	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state<string>('');
	let selectedPostingTypes = $state<PostingType[]>(['DEBIT', 'CREDIT']);

	let filterOpen = $state<boolean>(false);

	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');

	let fromFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));

	let memberFilterItems = $derived<SelectItem[]>(
		$organizationStore?.personsOfOrganization.map((member) => ({
			data: { id: member.id, label: member.username },
			selected: true
		})) ?? []
	);

	const createPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: (model) => budgetService.createActivityPosting($organizationStore?.id!, activity?.id!, model),
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
			budgetService.updateActivityPosting($organizationStore?.id!, activity?.id!, selectedPosting?.id!, model),
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
		request: async (model) => await activityService.update($organizationStore?.id!, activity?.id!, model),
		schema: updateActivitySchema()
	});

	$effect(() => {
		if (postings) {
			fromFilterDate = getMinPostingDate(postings);
			toFilterDate = getMaxPostingDate(postings);
		}
	});

	$effect(() => {
		if (postings) filterPostings();
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

	async function onOpenCreatePosting(type: PostingType): Promise<void> {
		selectedPostingType = type;
		createPostingFormActions.setModel(
			createPostingSchema().cast({
				type: selectedPostingType
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

	async function promptCalendarPermissionRequest(): Promise<boolean> {
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
			await showAlert($t('routes.organization.activities.slug.page.calendar-request-prompt.denied'));
			return false;
		} catch {
			await showAlert($t('routes.organization.activities.slug.page.calendar-request-prompt.error'));
			return false;
		}
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
		filterPostings();
	}

	function togglePostingTypeSelected(type: PostingType): void {
		selectedPostingTypes = selectedPostingTypes.includes(type)
			? selectedPostingTypes.filter((_type) => _type !== type)
			: [...selectedPostingTypes, type];
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
		updatePostingFormActions.setModel(clone(selectedPosting));
		updatePostingModalOpen = true;
	}

	function onApplyFromFilterDate(date: string): void {
		fromFilterDate = date;
		filterPostings();
	}

	function resetFilter(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		memberFilterItems = [...memberFilterItems];
		selectedPostingTypes = ['DEBIT', 'CREDIT'];
		filterOpen = false;
	}

	function setPostingType(type: PostingType): void {
		selectedPostingType = type;
		updatePostingModelTouched = true;
	}
</script>

<Layout title={$t('routes.organization.activities.slug.page.title')} showBackButton>
	{@render activitySummary()}
	{@render postingsSummary()}
	<FabButton
		indexedLabel={$t('routes.organization.activities.slug.page.action-button')}
		icon={addOutline}
		buttons={activityEventButtons}
	/>
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
		</div>
		<div class="mt-3 flex items-center justify-center gap-2">
			<Button
				label={$t('routes.organization.activities.slug.page.postings-summary.add-credit')}
				color="primary"
				icon={cashOutline}
				clicked={() => onOpenCreatePosting('CREDIT')}
			/>
			<Button
				label={$t('routes.organization.activities.slug.page.postings-summary.add-debit')}
				color="tertiary"
				icon={walletOutline}
				clicked={() => onOpenCreatePosting('DEBIT')}
			/>
		</div>
		<Button
			icon={listOutline}
			expand="block"
			fill="outline"
			label={$t('routes.organization.activities.slug.page.postings-summary.transaction-history')}
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
					<div class="whitespace-nowrap">
						{posting.type === 'CREDIT' ? '+' : '-'}{formatter.currency(posting.amountInCents)}
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
		</form>
	</Card>
</Modal>

<!-- Update Posting -->
<Modal
	open={updatePostingModalOpen}
	dismissed={() => (updatePostingModalOpen = false)}
	touched={updatePostingModelTouched}
>
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
			placeholder={$t('routes.organization.activities.slug.page.modal.transaction-history.searchbar')}
			value={postingsSearchValue}
			onionInput={onSearchPostings}
		></ion-searchbar>
		<Button icon={filterOutline} clicked={() => (filterOpen = true)} />
	</div>
	{#if filteredPostings.length === 0}
		<div class="mt-3 text-center">
			<div class="mb-2">
				<ion-note>{$t('routes.organization.activities.slug.page.modal.transaction-history.no-transactions')}</ion-note>
			</div>
			{#if postings.length > 0}
				<Button
					icon={refreshOutline}
					label={$t('routes.organization.activities.slug.page.modal.transaction-history.reset-filters')}
					clicked={resetFilter}
				/>
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
	<Card title={$t('routes.organization.activities.slug.page.modal.activity-filter.card.title')} classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => togglePostingTypeSelected('DEBIT')}
				color="success"
				selected={selectedPostingTypes.includes('DEBIT')}
				icon={trendingUpOutline}
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.credit')}
			/>
			<Chip
				clicked={() => togglePostingTypeSelected('CREDIT')}
				color="danger"
				selected={selectedPostingTypes.includes('CREDIT')}
				icon={trendingDownOutline}
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.debit')}
			/>
		</div>
		<DatetimeInputItem
			max={toFilterDate}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.date.from')}
			value={fromFilterDate}
			changed={onApplyFromFilterDate}
		/>
		<DatetimeInputItem
			min={fromFilterDate}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.date.to')}
			value={toFilterDate}
			changed={(value) => (toFilterDate = value)}
		/>
		<MultiSelectItem
			icon={peopleOutline}
			allSelectedText={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.all-selected')}
			noneSelectedText={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.none-selected')}
			items={memberFilterItems}
			label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.label')}
			searchPlaceholder={$t(
				'routes.organization.activities.slug.page.modal.activity-filter.card.members.search-placeholder'
			)}
			selectAllIcon={peopleOutline}
			selectAllLabel={$t('routes.organization.activities.slug.page.modal.activity-filter.card.members.select-all')}
		/>
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.reset')}
				color="danger"
				icon={refreshOutline}
				fill="outline"
				clicked={resetFilter}
			/>
			<Button
				label={$t('routes.organization.activities.slug.page.modal.activity-filter.card.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={() => (filterOpen = false)}
			/>
		</div>
	</Card>
</Popover>
