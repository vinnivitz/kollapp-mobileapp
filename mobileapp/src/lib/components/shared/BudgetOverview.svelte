<script lang="ts">
	import type { ResponseBody } from '$lib/models/api';
	import type {
		ActivityTO,
		OrganizationBudgetCategoryResponseTO,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import {
		cardOutline,
		cashOutline,
		documentOutline,
		flashOutline,
		listOutline,
		peopleOutline,
		statsChartOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { number } from 'yup';

	import type { RouteId } from '$app/types';

	import { createUpdatePostingSchema } from '$lib/api/schemas/budget';
	import {
		AmountInputItem,
		Button,
		Card,
		Chip,
		DatetimeInputItem,
		InputItem,
		Modal,
		MultiSelectInputItem
	} from '$lib/components/core';
	import { IconLabel } from '$lib/components/core/display';
	import { PostingOverviewModal } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type MultiSelectItem, TourStepId } from '$lib/models/ui';
	import { customForm, formatter, getPersonOfOrganizationId, getUserId, hasOrganizationRole } from '$lib/utility';

	type Balance = {
		balance: string;
		credit: string;
		debit: string;
	};

	type CreatePostingModel = PostingCreateUpdateRequestTO & { activityId: number };

	type Properties = {
		activities: ActivityTO[];
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		personsOfOrganization: PersonOfOrganizationTO[];
		postings: PostingTO[];
		title: string;
		activity?: ActivityTO;
		index?: RouteId;
		tourId?: string;
		onCreateActivityPosting: (
			activityId: number,
			model: PostingCreateUpdateRequestTO
		) => Promise<ResponseBody<PostingTO>>;
		onCreateOrganizationPosting: (model: PostingCreateUpdateRequestTO) => Promise<ResponseBody<PostingTO>>;
		onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
		onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
		onTransferActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody<PostingTO>>;
		onTransferOrganizationPosting: (postingId: number) => Promise<ResponseBody<PostingTO>>;
		onUpdateActivityPosting: (
			activityId: number,
			postingId: number,
			model: PostingCreateUpdateRequestTO
		) => Promise<ResponseBody<PostingTO>>;
		onUpdateOrganizationPosting: (
			postingId: number,
			model: PostingCreateUpdateRequestTO
		) => Promise<ResponseBody<PostingTO>>;
		onCompleted?: () => Promise<void>;
		onOpenStatistics?: () => void;
	};

	let {
		activities,
		activity,
		budgetCategories,
		index,
		onCompleted,
		onCreateActivityPosting,
		onCreateOrganizationPosting,
		onDeleteActivityPosting,
		onDeleteOrganizationPosting,
		onOpenStatistics,
		onTransferActivityPosting,
		onTransferOrganizationPosting,
		onUpdateActivityPosting,
		onUpdateOrganizationPosting,
		personsOfOrganization,
		postings,
		title,
		tourId
	}: Properties = $props();

	const budgetCategoryItems = $derived<MultiSelectItem[]>(
		budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: category.defaultCategory
		}))
	);

	const personOfOrganizationItems = $derived.by<MultiSelectItem[]>(() => {
		const userId = getUserId();
		return [
			...personsOfOrganization.map((personOfOrganization) => ({
				data: { id: personOfOrganization.id, label: personOfOrganization.username },
				selected: personOfOrganization.userId === userId
			})),
			{
				data: { id: 0, label: $t('components.budget-overview.modal.person-of-organization.none') },
				selected: false
			}
		];
	});

	const activityItems = $derived<MultiSelectItem[]>([
		...activities.map((activityItem) => ({
			data: { id: activityItem.id, label: activityItem.name }
		})),
		{ data: { id: 0, label: $t('components.budget-overview.modal.activity.none') } }
	]);

	const createPostingSchema = createUpdatePostingSchema({
		organizationBudgetCategoryId: budgetCategories.find((category) => category.defaultCategory)?.id,
		personOfOrganizationId: getPersonOfOrganizationId()
	}).shape({
		activityId: number().default(activity?.id ?? 0)
	});

	let postingCreateModalOpen = $state<boolean>(false);
	let postingOverviewModalOpen = $state<boolean>(false);
	let formActions = $state<FormActions<CreatePostingModel>>();

	const balance = $derived.by<Balance>(() => {
		let totalIncome = 0;
		let totalExpense = 0;
		for (const posting of postings) {
			if (posting.type === 'CREDIT') totalIncome += posting.amountInCents;
			else totalExpense += posting.amountInCents;
		}
		const balanceAmount = totalIncome - totalExpense;
		return {
			balance: formatter.currency(balanceAmount),
			credit: formatter.currency(totalIncome),
			debit: formatter.currency(totalExpense)
		} satisfies Balance;
	});
	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const createPostingForm = new Form({
		actions: (actions) => (formActions = actions),
		completed: async ({ actions }) => {
			await onCompleted?.();
			postingCreateModalOpen = false;
			actions.set(createPostingSchema.getDefault());
		},
		failed: async () => (postingCreateModalOpen = false),
		request: async (model) =>
			model.activityId > 0 ? onCreateActivityPosting(model.activityId, model) : onCreateOrganizationPosting(model),
		schema: createPostingSchema
	});

	let selectedPostingType = $derived(createPostingForm.model.type);

	function onOpenCreatePosting(): void {
		selectedPostingType = createPostingForm.model.type;
		formActions?.set(createPostingSchema.getDefault());
		postingCreateModalOpen = true;
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		formActions?.patchByKey('type', type);
	}

	function getPostingTypeTitle(type: PostingType): string {
		return type === 'DEBIT'
			? $t('components.budget-overview.modal.title.debit')
			: $t('components.budget-overview.modal.title.credit');
	}
</script>

<Card border="secondary" {tourId} titleIconStart={cardOutline} {title}>
	<div class="flex flex-col items-center justify-center gap-2">
		<ion-text class="text-xl font-bold" color={balance.balance.startsWith('-') ? 'danger' : 'success'}
			>{balance.balance}</ion-text
		>
		<IconLabel
			iconColor="success"
			color="medium"
			icon={trendingUpOutline}
			label={$t('components.budget-overview.total-credit', { value: balance.credit })}
			size="sm"
		/>
		<IconLabel
			iconColor="danger"
			color="medium"
			icon={trendingDownOutline}
			label={$t('components.budget-overview.total-debit', { value: balance.debit })}
			size="sm"
		/>
		<IconLabel
			icon={cashOutline}
			iconColor="dark"
			color="medium"
			label={$t('components.budget-overview.total-postings', { value: postings.length })}
			size="sm"
		/>
	</div>
	<div class="mt-3 flex flex-col gap-1">
		<Button
			indexed={index ? '/organization' : undefined}
			expand="block"
			label={$t('components.budget-overview.add-posting')}
			color="primary"
			icon={cashOutline}
			clicked={onOpenCreatePosting}
		/>
		<Button
			indexed={index ? '/organization' : undefined}
			icon={listOutline}
			expand="block"
			fill="outline"
			label={$t('components.budget-overview.posting-overview')}
			clicked={() => (postingOverviewModalOpen = true)}
		/>
		{#if onOpenStatistics}
			<Button
				indexed={index ? `/organization/budget-statistics` : undefined}
				tourId={TourStepId.ORGANIZATION.STATISTICS_LINK}
				icon={statsChartOutline}
				expand="block"
				fill="outline"
				label={$t('components.budget-overview.statistics')}
				clicked={onOpenStatistics}
			/>
		{/if}
	</div>
</Card>

<Modal open={postingCreateModalOpen} dismissed={() => (postingCreateModalOpen = false)}>
	<Card
		iconColor={selectedPostingType === 'CREDIT' ? 'success' : 'danger'}
		titleIconStart={selectedPostingType === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
		title={getPostingTypeTitle(selectedPostingType)}
	>
		<form use:customForm={createPostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					color="success"
					icon={trendingUpOutline}
					label={$t('components.budget-overview.modal.credit')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					color="danger"
					icon={trendingDownOutline}
					label={$t('components.budget-overview.modal.debit')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
			</div>
			<InputItem name="purpose" label={$t('components.budget-overview.modal.purpose')} icon={documentOutline} />
			<AmountInputItem name="amountInCents" label={$t('components.budget-overview.modal.amount')} />
			<DatetimeInputItem name="date" label={$t('components.budget-overview.modal.date')} />
			<MultiSelectInputItem
				hidden={!isManager}
				name="personOfOrganizationId"
				icon={peopleOutline}
				multiple={false}
				label={$t('components.budget-overview.modal.person-of-organization.select')}
				searchPlaceholder={$t('components.budget-overview.modal.person-of-organization.search')}
				items={personOfOrganizationItems}
			/>
			{#if activityItems && activityItems.length > 0}
				<MultiSelectInputItem
					name="activityId"
					readonly={!!activity}
					icon={flashOutline}
					multiple={false}
					label={$t('components.budget-overview.modal.activity.select')}
					searchPlaceholder={$t('components.budget-overview.modal.activity.search')}
					items={activityItems}
				/>
			{/if}
			<MultiSelectInputItem
				name="organizationBudgetCategoryId"
				icon={cardOutline}
				multiple={false}
				label={$t('components.budget-overview.modal.budget-category.select')}
				searchPlaceholder={$t('components.budget-overview.modal.budget-category.search')}
				items={budgetCategoryItems}
			/>
		</form>
	</Card>
</Modal>

<PostingOverviewModal
	open={postingOverviewModalOpen}
	dismissed={() => (postingOverviewModalOpen = false)}
	{postings}
	{activities}
	{budgetCategories}
	{personsOfOrganization}
	completed={onCompleted}
	{onUpdateOrganizationPosting}
	{onUpdateActivityPosting}
	{onTransferOrganizationPosting}
	{onTransferActivityPosting}
	{onDeleteOrganizationPosting}
	{onDeleteActivityPosting}
/>
