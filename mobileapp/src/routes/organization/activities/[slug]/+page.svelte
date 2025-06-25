<script lang="ts">
	import type { BudgetPostingModel } from '$lib/models/models';
	import type { PageData } from './$types';

	import { Browser } from '@capacitor/browser';
	import { CalendarPermissionScope, CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import { alertController, loadingController } from 'ionic-svelte';
	import {
		addOutline,
		archiveOutline,
		calendarOutline,
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		listOutline,
		locationOutline,
		mapOutline,
		trashOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { type CreateBudgetPostingDto, createBudgetPostingSchema } from '$lib/api/dto/client/budget';
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
	import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';
	import { t } from '$lib/locales';
	import { BudgetPostingType } from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import {
		type FabButtonButtons,
		Form,
		type FormActions,
		type FormConfig,
		type ValidationResult
	} from '$lib/models/ui';
	import { budgetPostingsStore, localeStore, organizationStore } from '$lib/stores';
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

	const accountBalance = $derived(calculateAccountBalance($budgetPostingsStore ?? []));

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));

	const actionButtonButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: 'Delete event'
		},
		{ color: 'tertiary', handler: featureNotImplementedAlert, icon: archiveOutline, label: 'Archieve event' },
		{ color: 'primary', handler: onUpdateActivity, icon: createOutline, label: 'Edit event' }
	];

	const loaded = $state(budgetPostingsStore.initialized);

	let createPostingFormActions: FormActions<CreateBudgetPostingDto>;
	let updateActivityFormActions: FormActions<UpdateActivityDto>;
	let createPostingModalOpen = $state(false);
	let updateActivityModalOpen = $state(false);
	let transactionHistoryModalOpen = $state(false);
	let updateBudgetPostingModalOpen = $state(false);

	let selectedPostingType = $state<BudgetPostingType>(BudgetPostingType.DEBIT);

	const updateActivityFormConfig: FormConfig<UpdateActivityDto> = {
		exposedActions: (exposedActions) => (updateActivityFormActions = exposedActions),
		onSubmit: onUpdateSubmit,
		schema: updateActivitySchema()
	};

	const createPostingForm = $state(
		new Form(createBudgetPostingSchema().cast({}) as CreateBudgetPostingDto, {
			exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
			formatters: { amountInCents: currencyFormatter() },
			keyEventHandlers: { amountInCents: currencyKeyEventHandler },
			onSubmit: onSubmitRecord,
			parser: { amountInCents: currencyParser() },
			schema: createBudgetPostingSchema()
		})
	);

	let updateActivityForm = $state(
		new Form(updateActivitySchema().cast({}) as UpdateActivityDto, updateActivityFormConfig)
	);

	$effect(() => {
		if ($organizationStore && !activity) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
		}
	});

	async function onUpdateSubmit(model: UpdateActivityDto, result: ValidationResult): Promise<void> {
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

	async function onSubmitRecord(model: CreateBudgetPostingDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await accountingResource.addBudgetPosting(organizationId, model));
				if (result.valid) {
					createPostingFormActions.resetModel();
					createPostingModalOpen = false;
					await budgetPostingsStore.update(organizationId);
				}
			} else {
				showAlert($t('No organization ID found.'));
			}
			await loader.dismiss();
		}
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

	async function onUpdateActivity(): Promise<void> {
		if (!activity) {
			return showAlert($t('Activity could not be found.'));
		}
		updateActivityForm = new Form(activity, updateActivityFormConfig);
		updateActivityModalOpen = true;
	}

	function calculateAccountBalance(postings: BudgetPostingModel[]): AccountBalance {
		if (!activity?.id) return { balance: '0.00', income: '0.00', spent: '0.00' };
		postings = postings?.filter((posting) => posting.activityId === activity.id) ?? [];
		let totalIncome = 0,
			totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === BudgetPostingType.DEBIT) totalIncome += posting.amountInCents;
			else if (posting.type === BudgetPostingType.CREDIT) totalExpense += posting.amountInCents;
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

	async function onOpenCreatePosting(type: BudgetPostingType): Promise<void> {
		selectedPostingType = type;
		if (!activity) {
			return showAlert($t('routes.organization.page.activity.page.slug.modal.create-posting.no-activity'));
		}
		createPostingForm.model.activityId = activity.id;
		createPostingModalOpen = true;
	}

	function onSetPositionType(type: BudgetPostingType): void {
		selectedPostingType = type;
		createPostingFormActions.onUpdate('type', type);
	}

	function getCreatePostingTitle(type: BudgetPostingType): string {
		return type === BudgetPostingType.DEBIT
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
</script>

<Layout title="Event Details" showBackButton loading={!$loaded}>
	{@render eventSummary()}
	{@render budgetSummary()}
	{@render actionButton()}
</Layout>

{#snippet eventSummary()}
	<!-- svelte-ignore attribute_quoted -->
	<Card title={activity?.name} classList="mb-5" click={onUpdateActivity}>
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

{#snippet budgetSummary()}
	<Card title="Budget">
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
				click={() => onOpenCreatePosting(BudgetPostingType.DEBIT)}
			></Button>
			<Button
				label="Add expense"
				color="tertiary"
				icon={walletOutline}
				click={() => onOpenCreatePosting(BudgetPostingType.CREDIT)}
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

<Modal
	open={createPostingModalOpen}
	confirm={() => createPostingFormActions.onSubmit()}
	dismissed={() => (createPostingModalOpen = false)}
>
	<Card title={getCreatePostingTitle(selectedPostingType)}>
		<form use:customForm={createPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === BudgetPostingType.DEBIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
					clicked={() => onSetPositionType(BudgetPostingType.DEBIT)}
				/>
				<Chip
					selected={selectedPostingType === BudgetPostingType.CREDIT}
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
					clicked={() => onSetPositionType(BudgetPostingType.CREDIT)}
				/>
			</div>
			<TextareaItem name="purpose" label="Purpose" icon={documentOutline} maxlength={200} />
			<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
			<DatetimeInputItem
				label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
				apply={(value) => createPostingFormActions.onUpdate('date', value)}
			/>
		</form>
	</Card>
</Modal>

<Modal open={transactionHistoryModalOpen} dismissed={() => (transactionHistoryModalOpen = false)}>
	<ion-list>
		<ion-list-header>Transactions</ion-list-header>
		<ion-searchbar class="w-full"></ion-searchbar>
		<div class="mb-2 flex items-center justify-center gap-2">
			<Chip color="success" selected icon={trendingUpOutline} label="Income"></Chip>
			<Chip color="danger" selected icon={trendingDownOutline} label="Expense"></Chip>
		</div>
		{#each $budgetPostingsStore ?? [] as posting (posting.id)}
			<CustomItem
				click={() => (updateBudgetPostingModalOpen = true)}
				iconColor={posting.type === BudgetPostingType.CREDIT ? 'danger' : 'success'}
				icon={posting.type === BudgetPostingType.CREDIT ? trendingDownOutline : trendingUpOutline}
			>
				<div class="flex w-full items-center justify-between gap-2">
					<ion-label class="truncate">
						{posting.purpose}
					</ion-label>
					<div class="flex items-center justify-center gap-2">
						<ion-icon icon={cashOutline}></ion-icon>
						<ion-label
							>{posting.type === BudgetPostingType.CREDIT ? '-' : '+'}{currencyFormatter()(
								posting.amountInCents
							)}</ion-label
						>
					</div>
				</div>
			</CustomItem>
		{/each}
	</ion-list>
</Modal>

<Modal open={updateBudgetPostingModalOpen} dismissed={() => (updateBudgetPostingModalOpen = false)}>
	<Card title="Update transaction"></Card>
</Modal>
