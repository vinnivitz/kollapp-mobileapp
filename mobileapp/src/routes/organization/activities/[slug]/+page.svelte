<script lang="ts">
	import type { PageData } from './$types';

	import { addDays, formatDistanceToNow } from 'date-fns';
	import { alertController, loadingController } from 'ionic-svelte';
	import {
		addOutline,
		archiveOutline,
		calendarOutline,
		cashOutline,
		createOutline,
		documentOutline,
		locationOutline,
		trashOutline,
		walletOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';

	import { type CreateBudgetPostingDto, createBudgetPostingSchema } from '$lib/api/dto/client/budget';
	import { type UpdateActivityDto, updateActivitySchema } from '$lib/api/dto/client/organization';
	import { accountingResource, organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LocationItem from '$lib/components/widgets/ionic/LocationItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';
	import { t } from '$lib/locales';
	import { BudgetPostingType } from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import { Form, type FormActions, type FormConfig, type ValidationResult } from '$lib/models/ui';
	import { localeStore, organizationStore } from '$lib/stores';
	import {
		clickOutside,
		customForm,
		featureNotImplementedAlert,
		getDateFnsLocale,
		getValidationResult,
		showAlert,
		StatusCheck
	} from '$lib/utility';

	type AccountBalance = {
		balance: string;
		income: string;
		spent: string;
	};

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));

	let actionsButtonElement = $state<HTMLIonFabElement>();
	let loaded = $state(false);

	let createPostingActions: FormActions<CreateBudgetPostingDto>;
	let updateActivityActions: FormActions<UpdateActivityDto>;
	let createPostingModalOpen = $state(false);
	let updateActivityModalOpen = $state(false);

	let accountBalance = $state<AccountBalance | undefined>();
	let selectedPostingType = $state<BudgetPostingType>(BudgetPostingType.DEBIT);

	const createPostingConfig: FormConfig<CreateBudgetPostingDto> = {
		exposedActions: (exposedActions) => (createPostingActions = exposedActions),
		formatters: { amountInCents: currencyFormatter() },
		keyEventHandlers: {
			amountInCents: (_event, update) => {
				if (_event.key === 'Backspace') {
					update(Math.floor((createPostingForm.model.amountInCents ?? 0) / 10));
				}
			}
		},
		onSubmit: onSubmitRecord,
		parser: { amountInCents: currencyParser() },
		schema: createBudgetPostingSchema()
	};

	const updateConfig: FormConfig<UpdateActivityDto> = {
		exposedActions: (exposedActions) => (updateActivityActions = exposedActions),
		onSubmit: onUpdateSubmit,
		schema: updateActivitySchema()
	};

	let createPostingForm = $state(
		new Form(createBudgetPostingSchema().cast({}) as CreateBudgetPostingDto, createPostingConfig)
	);

	let updateForm = $state(new Form(updateActivitySchema().cast({}) as UpdateActivityDto, updateConfig));

	$effect(() => {
		if ($organizationStore && !activity) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT);
		}
	});

	function currencyFormatter() {
		const nf = new Intl.NumberFormat($localeStore, {
			currency: 'EUR',
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
			style: 'currency'
		});

		return (cents: number): string => nf.format(cents / 100);
	}

	function currencyParser() {
		return (raw: string): number => {
			const digits = raw.replaceAll(/\D/g, '');
			const padded = digits.padStart(3, '0');
			const eurosPart = padded.slice(0, -2);
			const centsPart = padded.slice(-2);
			return Number.parseInt(eurosPart, 10) * 100 + Number.parseInt(centsPart, 10);
		};
	}

	async function onUpdateSubmit(model: UpdateActivityDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				if (activity?.id) {
					result = getValidationResult(await organizationResource.updateActivity(organizationId, activity?.id, model));
					if (result.valid) {
						updateActivityActions.resetModel();
						updateActivityModalOpen = false;
						organizationStore.update(organizationId);
					} else {
						updateActivityActions.applyValidationFeedback(result);
					}
				} else {
					showAlert($t('routes.organization.page.activity.no-activity-id'));
				}
			} else {
				showAlert($t('routes.organization.page.activity.no-organization-id'));
			}
			await loader.dismiss();
		}
	}

	async function onSubmitRecord(model: CreateBudgetPostingDto, result: ValidationResult): Promise<void> {
		if (result.valid) {
			const loader = await loadingController.create({});
			await loader.present();
			const organizationId = $organizationStore?.id;
			if (organizationId) {
				result = getValidationResult(await accountingResource.addBudgetPosting(organizationId, model));
				if (result.valid) {
					createPostingModalOpen = false;
					await organizationStore.update(organizationId);
				} else {
					showAlert($t('Failed to add income.'));
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

	function onEditActivity(): void {
		if (!activity) {
			showAlert($t('Activity could not be found.'));
			return;
		}
		updateForm = new Form(activity, updateConfig);
		updateActivityModalOpen = true;
	}

	async function calculateAccountBalance(): Promise<AccountBalance | undefined> {
		if (activity?.id) {
			const response = await accountingResource.getBudgetPostings(activity.id);
			if (StatusCheck.isOK(response.status)) {
				const postings = response.data.postings.filter((posting) => posting.activityId === activity?.id);
				const totalIncome = postings
					.filter((posting) => posting.type === BudgetPostingType.DEBIT)
					.reduce((sum, posting) => sum + posting.amountInCents, 0);
				const totalExpense = postings
					.filter((posting) => posting.type === BudgetPostingType.CREDIT)
					.reduce((sum, posting) => sum + posting.amountInCents, 0);
				const balance = totalIncome - totalExpense;
				return { balance: balance.toFixed(2), income: totalIncome.toFixed(2), spent: totalExpense.toFixed(2) };
			}
		}
	}

	function onOpenCreatePosting(type: BudgetPostingType): void {
		selectedPostingType = type;
		const model = createBudgetPostingSchema().cast({ activityId: activity?.id, type }) as CreateBudgetPostingDto;
		createPostingForm = new Form(model, createPostingConfig);
		createPostingModalOpen = true;
	}

	function onSetPositionType(type: BudgetPostingType): void {
		selectedPostingType = type;
		createPostingActions.onUpdate('type', type);
	}

	function getCreatePostingTitle(type: BudgetPostingType): string {
		return type === BudgetPostingType.DEBIT
			? $t('routes.organization.page.activity.page.slug.modal.create-posting.title.income')
			: $t('routes.organization.page.activity.page.slug.modal.create-posting.title.expense');
	}

	onMount(async () => {
		accountBalance = await calculateAccountBalance();
		loaded = true;
	});
</script>

<Layout title="Event Details" showBackButton loading={!loaded}>
	{@render actionsButton()}
	{@render eventSummary()}
	{@render budget()}
</Layout>

{#snippet budget()}
	<Card title="Budget">
		<div class="flex flex-col items-center justify-center gap-2">
			<ion-text class="text-lg font-bold">Account balance: {accountBalance?.balance} €</ion-text>
			<ion-text class="text-sm text-gray-500">Total expense: {accountBalance?.spent} €</ion-text>
			<ion-text class="text-sm text-gray-500">Total incoming: {accountBalance?.income} €</ion-text>
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
	</Card>
{/snippet}

{#snippet eventSummary()}
	<!-- svelte-ignore attribute_quoted -->
	<Card title={activity?.name} classList="mb-5" click={() => (updateActivityModalOpen = true)}>
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
	</Card>
{/snippet}

{#snippet actionsButton()}
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-fab
		bind:this={actionsButtonElement}
		slot="fixed"
		vertical="bottom"
		horizontal="end"
		use:clickOutside
		on:blur={actionsButtonElement?.close}
	>
		<ion-fab-button color="secondary" translucent aria-label="Event actions">
			<ion-icon icon={addOutline}></ion-icon>
		</ion-fab-button>
		<ion-fab-list side="top">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-fab-button aria-label="Delete event" color="danger" on:click={onDeleteActivity}>
				<ion-icon icon={trashOutline}></ion-icon>
			</ion-fab-button>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-fab-button aria-label="Archieve event" color="tertiary" on:click={featureNotImplementedAlert}>
				<ion-icon icon={archiveOutline}></ion-icon>
			</ion-fab-button>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-fab-button aria-label="Edit event" color="primary" on:click={onEditActivity}>
				<ion-icon icon={createOutline}></ion-icon>
			</ion-fab-button>
		</ion-fab-list>
	</ion-fab>
{/snippet}

{#key updateForm}
	<Modal
		dismissed={() => (updateActivityModalOpen = false)}
		isOpen={updateActivityModalOpen}
		confirm={() => updateActivityActions.onSubmit()}
		confirmLabel={$t('routes.organization.page.activity.edit-modal.button.confirm')}
	>
		{#if updateActivityModalOpen}
			<Card title={$t('routes.organization.page.activity.edit-modal.card.title')}>
				<form use:customForm={updateForm}>
					<InputItem
						name="name"
						label={$t('routes.organization.page.activity.create-modal.card.input.name')}
						icon={documentOutline}
					/>
					<LocationItem
						label={$t('routes.organization.page.activity.update-modal.card.input.location')}
						name="location"
					/>
					<DatetimeInputItem label="Date" />
				</form>
			</Card>
		{/if}
	</Modal>
{/key}

<Modal
	isOpen={createPostingModalOpen}
	dismissed={() => (createPostingModalOpen = false)}
	confirm={() => createPostingActions.onSubmit()}
>
	{#if createPostingModalOpen}
		<Card title={getCreatePostingTitle(selectedPostingType)}>
			<form use:customForm={createPostingForm}>
				<div class="mb-3 flex items-center justify-center gap-2">
					<Chip
						selected={selectedPostingType === BudgetPostingType.CREDIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.income')}
						clicked={() => onSetPositionType(BudgetPostingType.DEBIT)}
					/>
					<Chip
						selected={selectedPostingType === BudgetPostingType.DEBIT}
						label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.expense')}
						clicked={() => onSetPositionType(BudgetPostingType.CREDIT)}
					/>
				</div>
				<TextareaItem name="purpose" label="Purpose" icon={documentOutline} maxlength={200} />
				<InputItem name="amountInCents" label="Amount" icon={cashOutline} />
				<DatetimeInputItem
					label={$t('routes.organization.page.activity.page.slug.modal.create-posting.form.date')}
					apply={(value) => createPostingActions.onUpdate('date', value)}
				/>
			</form>
		</Card>
	{/if}
</Modal>
