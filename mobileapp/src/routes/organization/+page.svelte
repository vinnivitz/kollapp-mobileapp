<script lang="ts">
	import type {
		ActivityTO,
		OrganizationTO,
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
		refreshOutline,
		ribbonOutline,
		saveOutline,
		swapHorizontalOutline,
		trashBinOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline,
		warningOutline
	} from 'ionicons/icons';
	import { SvelteSet } from 'svelte/reactivity';

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
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import MultiSelectItem from '$lib/components/widgets/ionic/MultiSelectItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption, type SelectItem } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		clone,
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

	const organizations = $derived(organizationStore.organizations);
	const postings = $derived([
		...($organizationStore?.organizationPostings ?? []),
		...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
	]);
	const balance = $derived(calculateBalance(postings ?? []));
	const organizationRole = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.organizationRole
	);
	let createPostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();
	let updatePostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();

	let createPostingModalOpen = $state<boolean>(false);
	let updatePostingModalOpen = $state<boolean>(false);
	let postingsHistoryModalOpen = $state<boolean>(false);

	let updatePostingModelTouched = $state<boolean>(false);
	let filteredPostings = $state<PostingTO[]>([]);
	let postingsSearchValue = $state<string>('');

	let postingsFilterOpen = $state<boolean>(false);

	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');
	const selectedPostingTypes = new SvelteSet<PostingType>(['DEBIT', 'CREDIT']);
	let descriptionExpanded = $state<boolean>(false);
	let fromFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));
	let toFilterDate = $state<string>(format(new TZDate(), 'yyyy-MM-dd'));

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

	let filteredActivityFilterItems = $state<number[]>([]);

	const pendingMembersCount = $derived(
		$organizationStore?.personsOfOrganization.filter(
			(personOfOrganization) => personOfOrganization.status === 'PENDING'
		).length ?? 0
	);

	let selectedActivity = $state<ActivityTO>();
	let organizationDescriptionNote = $state<HTMLIonNoteElement>();

	const organizationDescriptionNoteTruncated = $derived(
		organizationDescriptionNote && organizationDescriptionNote?.scrollWidth > organizationDescriptionNote?.clientWidth
	);

	const createPostingForm = new Form({
		completed: async () => {
			await organizationStore.update($organizationStore?.id!);
			createPostingModalOpen = false;
		},
		exposedActions: (exposedActions) => (createPostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency, date: formatter.date },
		parsers: { amountInCents: parser.currency, date: parser.date },
		request: async (model) => {
			return selectedActivity && selectedActivity.id > 0
				? budgetService.createActivityPosting($organizationStore?.id!, selectedActivity.id, model)
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
		if (postings && activityFilterItems.length > 0 && filteredActivityFilterItems.length === 0) {
			fromFilterDate = getMinPostingDate(postings);
			toFilterDate = getMaxPostingDate(postings);
			filteredActivityFilterItems = activityFilterItems.map((item) => item.data.id);
		}
	});

	$effect(() => {
		if (postings) filteredPostings = getFilteredPostings();
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

	function getPostingItemSlidingOptions(posting: PostingTO): ItemSlidingOption[] {
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

	function getFilteredPostings(): PostingTO[] {
		return postings.filter((posting) => {
			const matchesType = selectedPostingTypes.has(posting.type);
			const matchesDateRange =
				new TZDate(posting.date) >= new TZDate(fromFilterDate) && new TZDate(posting.date) <= new TZDate(toFilterDate);

			const postingActivity = $organizationStore?.activities.find((activity) =>
				activity.activityPostings.some((activityPosting) => activityPosting.id === posting.id)
			);
			const isOrganizationPosting = $organizationStore?.organizationPostings.some(
				(organizationPosting) => organizationPosting.id === posting.id
			);

			const matchesActivities = filteredActivityFilterItems.some((activityId) => {
				if (activityId === 0) {
					return isOrganizationPosting;
				}
				return postingActivity?.id === activityId;
			});

			let matchesSearch = true;
			if (postingsSearchValue.trim() !== '') {
				const matchesPurpose = posting.purpose.toLowerCase().includes(postingsSearchValue.toLowerCase());
				const matchesActivityName =
					postingActivity?.name.toLowerCase().includes(postingsSearchValue.toLowerCase()) ?? false;

				matchesSearch = matchesPurpose || matchesActivityName;
			}

			return matchesActivities && matchesType && matchesDateRange && matchesSearch;
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

	async function onOpenCreatePosting(type: PostingType): Promise<void> {
		selectedPostingType = type;
		createPostingFormActions?.setModel(
			createPostingSchema().cast({
				type: selectedPostingType
			} satisfies Partial<PostingCreateUpdateRequestTO>)
		);
		createPostingModalOpen = true;
	}

	function getPostingTranslation(type: PostingType): string {
		return type === 'DEBIT'
			? $t('routes.organization.page.posting-translation.debit')
			: $t('routes.organization.page.posting-translation.cedit');
	}

	async function onSearchPostings(event: CustomEvent): Promise<void> {
		postingsSearchValue = event.detail.value;
		getFilteredPostings();
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
		filteredPostings = getFilteredPostings();
	}

	function resetFilter(): void {
		fromFilterDate = getMinPostingDate(postings);
		toFilterDate = getMaxPostingDate(postings);
		postingsSearchValue = '';
		selectedPostingTypes.clear();
		selectedPostingTypes.add('DEBIT');
		selectedPostingTypes.add('CREDIT');
		filteredActivityFilterItems = activityFilterItems.map((item) => item.data.id);
		postingsFilterOpen = false;
	}

	function onConfirmSelectCreatePostingActivity(ids: number[]): void {
		selectedActivity = $organizationStore?.activities.find((activity) => activity.id === ids[0]);
		createPostingFormActions?.setModel({
			...createPostingForm.model
		} satisfies PostingCreateUpdateRequestTO);
	}

	function onConfirmSelectUpdatePostingActivity(ids: number[]): void {
		selectedActivity = $organizationStore?.activities.find((activity) => activity.id === ids[0]);
		updatePostingFormActions?.setModel({
			...updatePostingForm.model
		} satisfies PostingCreateUpdateRequestTO);
	}

	function getActivityPosting(postingId: number): ActivityTO | undefined {
		return $organizationStore?.activities.find((activity) =>
			activity.activityPostings.some((activityPosting) => activityPosting.id === postingId)
		);
	}

	function togglePostingTypeSelected(type: PostingType): void {
		if (selectedPostingTypes.has(type)) {
			selectedPostingTypes.delete(type);
		} else {
			selectedPostingTypes.add(type);
		}
		filteredPostings = postings.filter((posting) => selectedPostingTypes.has(posting.type));
	}

	function onConfirmSelectPostingActivities(ids: number[]): void {
		filteredActivityFilterItems = ids;
		filteredPostings = getFilteredPostings();
	}
</script>

<Layout title={$t('routes.organization.page.title')}>
	{#if !$organizationStore && $organizations.length > 0}
		{@render pendingOrganizationJoinRequestCard()}
	{/if}
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
		<LabeledItem
			label={$t('routes.organization.page.event-list.list.create-event')}
			icon={flashOutline}
			clicked={async () => {
				await goto(resolve('/organization/activities'));
				triggerClickByLabel($t('routes.organization.page.event-list.list.create-event'));
			}}
		/>
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
			<div class="flex flex-row items-start justify-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{$organizationStore?.place}</ion-text>
			</div>
		</div>
		<div class="mt-3 flex flex-row items-center justify-center gap-1">
			<ion-icon icon={ribbonOutline}></ion-icon>
			<ion-text class="font-semibold">You are a {getRoleTranslationFromRole(organizationRole!)}</ion-text>
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
		{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
			<div class="mt-3 flex items-center justify-center gap-2">
				<Button
					label={$t('routes.organization.page.budget-card.card.add-credit')}
					color="primary"
					icon={cashOutline}
					clicked={() => onOpenCreatePosting('CREDIT')}
				/>
				<Button
					label={$t('routes.organization.page.budget-card.card.add-debit')}
					color="tertiary"
					icon={walletOutline}
					clicked={() => onOpenCreatePosting('DEBIT')}
				/>
			</div>
		{/if}
		<Button
			icon={listOutline}
			classList="mx-2 mt-3"
			expand="block"
			fill="outline"
			label={$t('routes.organization.page.budget-card.card.postings-history')}
			clicked={() => (postingsHistoryModalOpen = true)}
		/>
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	<CustomItem
		slidingOptions={hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')
			? getPostingItemSlidingOptions(posting)
			: undefined}
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

{#snippet pendingOrganizationJoinRequestCard()}
	<Card border="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon color="warning" icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-text class="flex flex-wrap gap-2">
				<div>
					{$t('routes.organization.page.pending-organization-join-request-card.card.info')}
				</div>
				<div class="font-bold">{$organizations[0]?.name}</div>
			</ion-text>
		</div>
	</Card>
{/snippet}

<!-- Modals -->

<!-- Create Posting Modal -->
<Modal open={createPostingModalOpen} dismissed={() => (createPostingModalOpen = false)}>
	<Card title={getPostingTranslation(selectedPostingType)}>
		<form use:customForm={createPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.modal.create-posting.credit')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.modal.create-posting.debit')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.page.modal.create-posting.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem name="amountInCents" label={$t('routes.organization.page.modal.create-posting.amount')} />
			<DatetimeInputItem name="date" label={$t('routes.organization.page.modal.create-posting.date')} />
			{#if $organizationStore && $organizationStore.activities.length > 0}
				<MultiSelectItem
					changed={onConfirmSelectCreatePostingActivity}
					allSelectedText={$t('routes.organization.page.modal.create-posting.activities.all-selected')}
					icon={flashOutline}
					multiple={false}
					label={$t('routes.organization.page.modal.create-posting.activities.select')}
					searchPlaceholder={$t('routes.organization.page.modal.create-posting.activities.search')}
					items={activityFilterItems}
				/>
			{/if}
		</form>
	</Card>
</Modal>

<!-- Update Posting Modal -->
<Modal
	open={updatePostingModalOpen}
	touched={updatePostingModelTouched}
	dismissed={() => (updatePostingModalOpen = false)}
>
	<Card title={$t('routes.organization.page.modal.update-posting.card.title')}>
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.page.modal.update-posting.card.credit')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.page.modal.update-posting.card.debit')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.page.modal.update-posting.card.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem name="amountInCents" label={$t('routes.organization.page.modal.update-posting.card.amount')} />
			<DatetimeInputItem name="date" label={$t('routes.organization.page.modal.update-posting.card.date')} />
			{#if $organizationStore && $organizationStore.activities.length > 0}
				<MultiSelectItem
					changed={onConfirmSelectUpdatePostingActivity}
					allSelectedText={$t('routes.organization.page.modal.update-posting.card.activities.all-selected')}
					icon={flashOutline}
					multiple={false}
					label={$t('routes.organization.page.modal.update-posting.card.activities.select')}
					searchPlaceholder={$t('routes.organization.page.modal.update-posting.card.activities.search')}
					items={activityFilterItems}
				/>
			{/if}
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
		<div class="sticky top-0 left-0 z-10 flex items-center justify-center gap-2">
			<ion-searchbar
				class="w-full"
				debounce={100}
				placeholder={$t('routes.organization.page.modal.postings-history.search')}
				value={postingsSearchValue}
				onionInput={onSearchPostings}
			></ion-searchbar>
			<Button icon={filterOutline} clicked={() => (postingsFilterOpen = true)} />
		</div>
		{#if filteredPostings.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>{$t('routes.organization.page.modal.postings-history.not-found')}</ion-note>
				{#if postings.length > 0}
					<Button
						icon={refreshOutline}
						label={$t('routes.organization.page.modal.postings-history.reset-filters')}
						clicked={resetFilter}
					/>
				{/if}
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
<Popover extended open={postingsFilterOpen} dismissed={() => (postingsFilterOpen = false)} lazy>
	<Card title={$t('routes.organization.page.modal.postings-filter.card.title')} classList="m-0">
		<div class="flex items-center justify-center gap-2">
			<Chip
				clicked={() => togglePostingTypeSelected('DEBIT')}
				color="success"
				selected={selectedPostingTypes.has('DEBIT')}
				icon={trendingUpOutline}
				label={$t('routes.organization.page.modal.postings-filter.card.credit')}
			/>
			<Chip
				clicked={() => togglePostingTypeSelected('CREDIT')}
				color="danger"
				selected={selectedPostingTypes.has('CREDIT')}
				icon={trendingDownOutline}
				label={$t('routes.organization.page.modal.postings-filter.card.debit')}
			/>
		</div>
		<DatetimeInputItem
			max={toFilterDate}
			label={$t('routes.organization.page.modal.postings-filter.card.from')}
			value={fromFilterDate}
			changed={onApplyFromFilterDate}
		/>
		<DatetimeInputItem
			min={fromFilterDate}
			label={$t('routes.organization.page.modal.postings-filter.card.to')}
			value={toFilterDate}
			changed={(value) => (toFilterDate = value)}
		/>
		{#if $organizationStore && $organizationStore.activities.length > 0}
			<MultiSelectItem
				value={filteredActivityFilterItems}
				changed={onConfirmSelectPostingActivities}
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
				clicked={resetFilter}
			/>
			<Button
				label={$t('routes.organization.page.modal.postings-filter.card.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={() => (postingsFilterOpen = false)}
			/>
		</div>
	</Card>
</Popover>
