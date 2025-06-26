<script lang="ts">
	import type { PageData } from './$types';

	import { Browser } from '@capacitor/browser';
	import { CalendarPermissionScope, CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { addDays, format, formatDistanceToNow } from 'date-fns';
	import { alertController, loadingController } from 'ionic-svelte';
	import {
		addOutline,
		archiveOutline,
		calendarClearOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
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

	import {
		type CreateAccountPostingDto,
		createAccountPostingSchema,
		type UpdateAccountPostingDto,
		updateAccountPostingSchema
	} from '$lib/api/dto/client/accounting';
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
	import {
		type FabButtonButtons,
		Form,
		type FormActions,
		type FormConfig,
		type ValidationResult
	} from '$lib/models/ui';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		clickOutside,
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

	const actionButtonButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: 'Delete event'
		},
		{ color: 'tertiary', handler: featureNotImplementedAlert, icon: archiveOutline, label: 'Archieve event' },
		{ color: 'primary', handler: onOpenUpdateActivityModal, icon: createOutline, label: 'Edit event' }
	];

	const loaded = $state(accountPostingsStore.initialized);

	let createPostingFormActions: FormActions<CreateAccountPostingDto>;
	let updatePostingFormActions: FormActions<CreateAccountPostingDto>;
	let updateActivityFormActions: FormActions<UpdateActivityDto>;
	let createPostingModalOpen = $state(false);
	let updatePostingModalOpen = $state(false);
	let updateActivityModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);

	let filteredPostings = $state<AccountPostingModel[]>([]);
	let postingsSearchValue = $state('');
	let selectedPostingTypes: AccountPostingType[] = $state([AccountPostingType.DEBIT, AccountPostingType.CREDIT]);

	let selectedPosting = $state<AccountPostingModel | undefined>();

	let selectedPostingType = $state<AccountPostingType>(AccountPostingType.DEBIT);

	let slidingMap: Map<number, HTMLIonItemSlidingElement> = new Map();
	let transactionsList = $state<HTMLIonListElement | undefined>();

	const createPostingFormConfig: FormConfig<CreateAccountPostingDto> = {
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: currencyFormatter() },
		keyEventHandlers: { amountInCents: currencyKeyEventHandler() },
		onSubmit: onCreateAccountPosting,
		parser: { amountInCents: currencyParser() },
		schema: createAccountPostingSchema()
	};

	const updatePostingFormConfig: FormConfig<CreateAccountPostingDto> = {
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: currencyFormatter() },
		keyEventHandlers: { amountInCents: currencyKeyEventHandler() },
		onSubmit: onUpdateAccountPosting,
		parser: { amountInCents: currencyParser() },
		schema: createAccountPostingSchema()
	};

	const updateActivityFormConfig: FormConfig<UpdateActivityDto> = {
		exposedActions: (exposedActions) => (updateActivityFormActions = exposedActions),
		onSubmit: onUpdateActivity,
		schema: updateActivitySchema()
	};

	let createAccountPostingForm = $state(
		new Form(createAccountPostingSchema().cast({}) as CreateAccountPostingDto, createPostingFormConfig)
	);

	let updateAccountPostingForm = $state(
		new Form(updateAccountPostingSchema().cast({}) as CreateAccountPostingDto, updatePostingFormConfig)
	);

	let updateActivityForm = $state(
		new Form(updateActivitySchema().cast({}) as UpdateActivityDto, updateActivityFormConfig)
	);

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

	function storeSliding(node: HTMLIonItemSlidingElement, postingId: number): { destroy: () => void } {
		slidingMap.set(postingId, node);
		return {
			destroy(): void {
				slidingMap.delete(postingId);
			}
		};
	}

	async function onUpdateActivity(model: UpdateActivityDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				if (activity?.id) {
					result = getValidationResult(await organizationResource.updateActivity(organizationId, activity?.id, model));
					if (result.valid) {
						await organizationStore.update(organizationId);
					} else {
						updateActivityFormActions.applyValidationFeedback(result);
					}
				} else {
					showAlert($t('routes.organization.page.activity.no-activity-id'));
				}
			} else {
				showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
		}
		updateActivityModalOpen = false;
	}

	async function onCreateAccountPosting(model: CreateAccountPostingDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await accountingResource.addAccountPosting(organizationId, model));
				if (result.valid) {
					createPostingFormActions.resetModel();
					createPostingModalOpen = false;
					await accountPostingsStore.update(organizationId);
				}
			}
			await loader.dismiss();
		}
	}

	async function onUpdateAccountPosting(model: UpdateAccountPostingDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId && selectedPosting?.id) {
				result = getValidationResult(
					await accountingResource.updateAccountPosting(organizationId, selectedPosting.id, model)
				);
				if (result.valid) {
					updatePostingModalOpen = false;
					await accountPostingsStore.update(organizationId);
				} else {
					updatePostingFormActions.applyValidationFeedback(result);
				}
			}
			await loader.dismiss();
		}
		updatePostingModalOpen = false;
		selectedPosting = undefined;
	}

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
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			if (activity?.id) {
				const result = getValidationResult(await organizationResource.deleteActivity(organizationId, activity?.id));
				if (result.valid) {
					await organizationStore.update(organizationId);
					updateActivityModalOpen = false;
					goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
				}
			} else {
				showAlert($t('routes.organization.page.activity.no-activity-id'));
			}
		} else {
			showAlert($t('routes.organization.page.activity.no-organization-id'));
		}
		await loader.dismiss();
	}

	async function onOpenUpdateActivityModal(): Promise<void> {
		if (!activity) {
			return showAlert($t('Activity could not be found.'));
		}
		updateActivityForm = new Form(activity, updateActivityFormConfig);
		updateActivityModalOpen = true;
	}

	function calculateAccountBalance(postings: AccountPostingModel[]): AccountBalance {
		if (!activity?.id) return { balance: '0.00', income: '0.00', spent: '0.00' };
		let totalIncome = 0,
			totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === AccountPostingType.DEBIT) totalIncome += posting.amountInCents;
			else if (posting.type === AccountPostingType.CREDIT) totalExpense += posting.amountInCents;
		}
		const balance = totalIncome - totalExpense;
		return {
			balance: toEuro(balance),
			income: toEuro(totalIncome),
			spent: toEuro(totalExpense)
		};
	}

	function toEuro(cents: number): string {
		return (cents / 100).toFixed(2);
	}

	async function onOpenCreatePosting(type: AccountPostingType): Promise<void> {
		selectedPostingType = type;
		if (!activity) {
			return showAlert($t('routes.organization.page.activity.page.slug.modal.create-posting.no-activity'));
		}
		createAccountPostingForm = new Form(
			createAccountPostingSchema().cast({
				activityId: activity.id,
				type
			}) as CreateAccountPostingDto,
			createPostingFormConfig
		);
		createPostingModalOpen = true;
	}

	function onSetCreatePostingType(type: AccountPostingType): void {
		selectedPostingType = type;
		createPostingFormActions.onUpdate('type', type);
	}

	function onSetUpdatePostingType(type: AccountPostingType): void {
		selectedPostingType = type;
		updatePostingFormActions.onUpdate('type', type);
	}

	function getCreatePostingTitle(type: AccountPostingType): string {
		return type === AccountPostingType.DEBIT
			? $t('routes.organization.page.activity.page.slug.modal.create-posting.title.income')
			: $t('routes.organization.page.activity.page.slug.modal.create-posting.title.expense');
	}

	async function onOpenLocation(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		await Browser.open({ url: `geo:0,0?q=${encodeURIComponent(activity?.location ?? '')}` });
	}

	async function onAddToCalendar(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		if (!(await requestCalendarPermission()) || !activity) return;
		CapacitorCalendar.createEvent({
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
			} else if (permission.result === 'prompt') {
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
		console.log('posting', posting);
		updateAccountPostingForm = new Form(
			updateAccountPostingSchema().cast(posting) as CreateAccountPostingDto,
			updatePostingFormConfig
		);
		selectedPostingType = posting.type;
		updatePostingModalOpen = true;
	}
</script>

<Layout title="Event Details" showBackButton loading={!$loaded}>
	{@render eventSummary()}
	{@render accountSummary()}
	{@render actionButton()}
</Layout>

{#snippet eventSummary()}
	<!-- svelte-ignore attribute_quoted -->
	<Card title={activity?.name} classList="mb-5" click={onOpenUpdateActivityModal}>
		<div class="flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{activity?.location}</ion-text>
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
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button icon={mapOutline} size="small" fill="clear" label="Open in map" click={onOpenLocation}></Button>
			<Button icon={calendarOutline} size="small" fill="clear" label="Add to calendar" click={onAddToCalendar} />
		</div>
	</Card>
{/snippet}

{#snippet accountSummary()}
	<Card>
		<div class="flex flex-col items-center justify-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text class="text-lg font-bold">Account balance: {accountBalance?.balance} €</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={trendingUpOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total incoming: {accountBalance?.income} €</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={trendingDownOutline}></ion-icon>
				<ion-text class="text-sm text-gray-500">Total expense: {accountBalance?.spent} €</ion-text>
			</div>
		</div>
		<div class="mt-3 flex items-center justify-center gap-2">
			<Button
				label="Add income"
				color="primary"
				icon={cashOutline}
				click={() => onOpenCreatePosting(AccountPostingType.DEBIT)}
			></Button>
			<Button
				label="Add expense"
				color="tertiary"
				icon={walletOutline}
				click={() => onOpenCreatePosting(AccountPostingType.CREDIT)}
			></Button>
		</div>
		<Button
			icon={listOutline}
			expand="block"
			fill="outline"
			label="Transaction history"
			click={() => (transactionHistoryModalOpen = true)}
		></Button>
	</Card>
{/snippet}

{#snippet actionButton()}
	<FabButton label="Event actions" icon={addOutline} buttons={actionButtonButtons} />
{/snippet}

{#key updateActivityForm}
	<Modal
		dismissed={() => (updateActivityModalOpen = false)}
		open={updateActivityModalOpen}
		confirm={() => updateActivityFormActions.onSubmit()}
		confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
	>
		{#if updateActivityModalOpen}
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
						selected={(value) => {
							updateActivityFormActions.onUpdate('location', value);
						}}
					/>
					<DatetimeInputItem label="Date" />
				</form>
			</Card>
		{/if}
	</Modal>
{/key}

{#key createAccountPostingForm}
	<Modal
		open={createPostingModalOpen}
		confirm={() => createPostingFormActions.onSubmit()}
		dismissed={() => (createPostingModalOpen = false)}
	>
		<Card title={getCreatePostingTitle(selectedPostingType)}>
			<form use:customForm={createAccountPostingForm}>
				<div class="mb-3 flex items-center justify-center gap-2">
					<Chip
						selected={selectedPostingType === AccountPostingType.DEBIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
						click={() => onSetCreatePostingType(AccountPostingType.DEBIT)}
					/>
					<Chip
						selected={selectedPostingType === AccountPostingType.CREDIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
						click={() => onSetCreatePostingType(AccountPostingType.CREDIT)}
					/>
				</div>
				<InputItem name="purpose" label="Purpose" icon={documentOutline} />
				<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
				<DatetimeInputItem
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
					apply={(value) => {
						console.log('value', value);
						createPostingFormActions.onUpdate('date', value);
					}}
				/>
			</form>
		</Card>
	</Modal>
{/key}

{#key updateAccountPostingForm}
	<Modal
		open={updatePostingModalOpen}
		confirm={() => updatePostingFormActions.onSubmit()}
		dismissed={() => (updatePostingModalOpen = false)}
	>
		<Card title={selectedPosting?.purpose}>
			<form use:customForm={updateAccountPostingForm}>
				<div class="mb-3 flex items-center justify-center gap-2">
					<Chip
						selected={selectedPostingType === AccountPostingType.DEBIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
						click={() => onSetUpdatePostingType(AccountPostingType.DEBIT)}
					/>
					<Chip
						selected={selectedPostingType === AccountPostingType.CREDIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
						click={() => onSetUpdatePostingType(AccountPostingType.CREDIT)}
					/>
				</div>
				<InputItem name="purpose" label="Purpose" icon={documentOutline} />
				<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
				<DatetimeInputItem
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
					apply={(value) => updatePostingFormActions.onUpdate('date', value)}
				/>
			</form>
		</Card>
	</Modal>
{/key}

<Modal open={transactionHistoryModalOpen} dismissed={() => (transactionHistoryModalOpen = false)}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-list use:clickOutside on:blur={transactionsList?.closeSlidingItems} bind:this={transactionsList}>
		<ion-list-header>Transactions</ion-list-header>
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
			></Chip>
			<Chip
				color="danger"
				click={() => toggleAccountPostingTypeSelected(AccountPostingType.CREDIT)}
				selected={selectedPostingTypes.includes(AccountPostingType.CREDIT)}
				icon={trendingDownOutline}
				label="Expense"
			></Chip>
		</div>
		{#if filteredPostings.length === 0}
			<div class="mt-3 text-center">
				<ion-note>No transactions found.</ion-note>
			</div>
		{:else}
			{#each filteredPostings as posting (posting.id)}
				<ion-item-sliding use:storeSliding={posting.id}>
					<CustomItem
						click={() => slidingMap.get(posting.id)?.open('end')}
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
								<ion-text color="medium" class="flex items-center justify-center gap-2">
									<ion-icon icon={calendarClearOutline}></ion-icon>
									<div>
										{format(new Date(posting.date), 'PPP')}
									</div>
								</ion-text>
								<ion-text color="medium" class="flex items-center justify-center gap-2">
									<ion-icon icon={cashOutline}></ion-icon>
									<div>
										{posting.type === AccountPostingType.CREDIT ? '-' : '+'}{currencyFormatter()(posting.amountInCents)}
									</div>
								</ion-text>
							</div>
						</div>
					</CustomItem>

					<ion-item-options slot="end">
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<ion-item-option color="tertiary" on:click={() => onOpenUpdatePostingModal(posting)}>
							<ion-icon slot="icon-only" icon={createOutline}></ion-icon>
						</ion-item-option>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<ion-item-option color="danger" expandable on:click={() => onDeletePosting(posting.id)}>
							<ion-icon slot="icon-only" icon={trashBinOutline}></ion-icon>
						</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			{/each}
		{/if}
	</ion-list>
</Modal>
