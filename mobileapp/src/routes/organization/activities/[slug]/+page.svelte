<script lang="ts">
	import type { PageData } from './$types';

	import { AppLauncher } from '@capacitor/app-launcher';
	import { CalendarPermissionScope, CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { isPlatform } from '@ionic/core';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import { alertController, loadingController } from 'ionic-svelte';
	import {
		addOutline,
		archiveOutline,
		calendarClearOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
		closeOutline,
		createOutline,
		documentOutline,
		listOutline,
		locationOutline,
		mapOutline,
		personOutline,
		trashBinOutline,
		trashOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type CreateAccountPostingDto, createAccountPostingSchema } from '$lib/api/dto/client/accounting';
	import { type UpdateActivityDto, updateActivitySchema } from '$lib/api/dto/client/organization';
	import { accountingResource, organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationItem from '$lib/components/widgets/ionic/LocationItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import { t } from '$lib/locales';
	import { type AccountPostingModel, AccountPostingType } from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import { type FabButtonButtons, Form, type FormActions } from '$lib/models/ui';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		currencyFormatter,
		currencyKeyEventHandler,
		currencyParser,
		customForm,
		featureNotImplementedAlert,
		getDateFnsLocale,
		getValidationResult,
		showAlert
	} from '$lib/utility';

	type AccountBalance = {
		balance: string;
		income: string;
		spent: string;
	};

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));
	const postings = $derived($accountPostingsStore?.filter((posting) => posting.activityId === activity?.id) ?? []);

	const accountBalance = $derived(calculateAccountBalance(postings ?? []));

	const activityEventButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: 'Delete event'
		},
		{ color: 'tertiary', handler: featureNotImplementedAlert, icon: archiveOutline, label: 'Archieve event' },
		{ color: 'primary', handler: onOpenUpdateActivityModal, icon: createOutline, label: 'Edit event' }
	];

	const loaded = $state(accountPostingsStore.loadedCache);

	let createAccountPostingFormActions: FormActions<CreateAccountPostingDto>;
	let updateAccountPostingFormActions: FormActions<CreateAccountPostingDto>;
	let updateActivityFormActions: FormActions<UpdateActivityDto>;

	let createAccountPostingModalOpen = $state(false);
	let updateAccountPostingModalOpen = $state(false);
	let updateActivityModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let filteredPostings = $state<AccountPostingModel[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes: AccountPostingType[] = $state([AccountPostingType.DEBIT, AccountPostingType.CREDIT]);

	let selectedPosting = $state<AccountPostingModel | undefined>();

	let selectedPostingType = $state<AccountPostingType>(AccountPostingType.DEBIT);

	const createAccountPostingForm = $derived(
		new Form({
			completed: async () => {
				await organizationStore.update($organizationStore?.id!);
				createAccountPostingModalOpen = false;
			},
			exposedActions: (exposedActions) => (createAccountPostingFormActions = exposedActions),
			formatters: { amountInCents: currencyFormatter() },
			keyEventHandlers: { amountInCents: currencyKeyEventHandler() },
			parsers: { amountInCents: currencyParser() },
			request: async (model) => accountingResource.addAccountPosting($organizationStore?.id!, model),
			schema: createAccountPostingSchema()
		})
	);

	$effect(() => {
		if (activity && selectedPostingType) {
			createAccountPostingFormActions.setModel(
				createAccountPostingSchema().cast({
					activityId: activity?.id,
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
		formatters: { amountInCents: currencyFormatter() },
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

	const updateActivityForm = $derived(
		new Form({
			completed: async () => {
				await organizationStore.update($organizationStore?.id!);
				updateActivityModalOpen = false;
			},
			exposedActions: (exposedActions) => (updateActivityFormActions = exposedActions),
			request: async (model) => organizationResource.updateActivity($organizationStore?.id!, activity?.id!, model),
			schema: updateActivitySchema()
		})
	);

	$effect(() => {
		updateActivityFormActions.setModel(activity);
	});

	$effect(() => {
		if (postings) {
			filterPostings();
		}
	});

	$effect(() => {
		if ($organizationStore && !activity) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
		}
	});

	async function onDeleteActivity(): Promise<void> {
		const alert = await alertController.create({
			buttons: [
				{ role: 'cancel', text: 'Cancel' },
				{ handler: async () => await deleteActivity(), text: 'Delete event' }
			],
			header: `Are you sure?`,
			message: `This action cannot be undone.`
		});
		await alert.present();
	}

	async function deleteActivity(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		if (!($organizationStore?.id && activity?.id)) return showAlert('No organization or activity found');
		await organizationResource.deleteActivity($organizationStore.id, activity?.id);
		await organizationStore.update($organizationStore.id);
		updateActivityModalOpen = false;
		await loader.dismiss();
		goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
	}

	async function onOpenUpdateActivityModal(): Promise<void> {
		if (!activity) return showAlert('Activity not found');
		updateActivityModalOpen = true;
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
			balance: currencyFormatter()(balance),
			income: currencyFormatter()(totalIncome),
			spent: currencyFormatter()(totalExpense)
		};
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

	function toggleAccountPostingTypeSelected(type: AccountPostingType): void {
		selectedPostingTypes = selectedPostingTypes.includes(type)
			? selectedPostingTypes.filter((_type) => _type !== type)
			: [...selectedPostingTypes, type];
		filterPostings();
	}

	function filterPostings(): void {
		filteredPostings = postings
			.filter((posting) => selectedPostingTypes.includes(posting.type))
			.filter((posting) => posting.purpose.toLowerCase().includes(postingsSearchValue.toLowerCase()));
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
</script>

<Layout title="Event Details" showBackButton loading={!$loaded}>
	{@render eventSummary()}
	{@render activityAccountSummary()}
	{@render actionButton()}
</Layout>

{#snippet eventSummary()}
	<!-- svelte-ignore attribute_quoted -->
	<Card border="secondary" title={activity?.name} classList="mb-5" click={() => (updateActivityModalOpen = true)}>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<div class="flex items-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{activity?.location}</ion-text>
			</div>
			<div class="flex items-center gap-1">
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
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button icon={mapOutline} size="small" fill="clear" label="Open in map" click={onOpenLocation}></Button>
			<Button icon={calendarOutline} size="small" fill="clear" label="Add to calendar" click={onAddToCalendar} />
		</div>
	</Card>
{/snippet}

{#snippet activityAccountSummary()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text class="text-lg font-bold">Event balance:</ion-text>
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
			expand="block"
			fill="outline"
			label="Transaction history"
			click={() => (transactionHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

{#snippet actionButton()}
	<FabButton label="Event actions" icon={addOutline} buttons={activityEventButtons} />
{/snippet}

{#key updateActivityForm}
	<Modal
		dismissed={() => (updateActivityModalOpen = false)}
		open={updateActivityModalOpen}
		confirm={() => updateActivityFormActions?.onSubmit()}
		confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
	>
		<Card title={$t('routes.organization.page.activity.edit-modal.card.title')}>
			<form use:customForm={updateActivityForm}>
				<InputItem
					name="name"
					label={$t('routes.organization.page.activity.create-modal.card.input.name')}
					icon={documentOutline}
				/>
				<LocationItem
					label={$t('routes.organization.page.activity.update-modal.card.input.location')}
					name="location"
					selected={(value) => updateActivityFormActions?.onUpdate('location', value)}
				/>
				<DatetimeInputItem label="Date" />
			</form>
		</Card>
	</Modal>
{/key}

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
				apply={(value) => createAccountPostingFormActions.onUpdate('date', value)}
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
				apply={(value) => updateAccountPostingFormActions.onUpdate('date', value)}
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
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-searchbar
		class="w-full"
		debounce={100}
		placeholder="Search transactions..."
		value={postingsSearchValue}
		on:ionInput={onSearchPostings}
	></ion-searchbar>
	<div class="mb-2 flex items-center justify-center gap-2">
		<Chip
			color="success"
			click={() => toggleAccountPostingTypeSelected(AccountPostingType.DEBIT)}
			selected={selectedPostingTypes.includes(AccountPostingType.DEBIT)}
			icon={trendingUpOutline}
			label="Income"
		/>
		<Chip
			color="danger"
			click={() => toggleAccountPostingTypeSelected(AccountPostingType.CREDIT)}
			selected={selectedPostingTypes.includes(AccountPostingType.CREDIT)}
			icon={trendingDownOutline}
			label="Expense"
		/>
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

{#snippet transactionItem(posting: AccountPostingModel)}
	<CustomItem
		slidingOptions={[
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
		]}
		iconColor={posting.type === AccountPostingType.CREDIT ? 'danger' : 'success'}
		icon={posting.type === AccountPostingType.CREDIT ? trendingDownOutline : trendingUpOutline}
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
					<div>{format(new Date(posting.date), 'PPP')}</div>
				</ion-text>
				<ion-text color="medium" class="flex items-center justify-center gap-1">
					<ion-icon icon={cashOutline}></ion-icon>
					<div>
						{posting.type === AccountPostingType.CREDIT ? '-' : '+'}{currencyFormatter()(posting.amountInCents)}
					</div>
				</ion-text>
			</div>
		</div>
	</CustomItem>
{/snippet}
