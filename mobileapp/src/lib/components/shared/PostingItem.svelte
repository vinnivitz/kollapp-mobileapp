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

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import {
		calendarClearOutline,
		cardOutline,
		createOutline,
		documentOutline,
		flashOutline,
		openOutline,
		peopleOutline,
		personOutline,
		sendOutline,
		trashBinOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { tick } from 'svelte';
	import { number, ObjectSchema } from 'yup';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { createUpdatePostingSchema } from '$lib/api/schemas/budget';
	import {
		AmountInputItem,
		Card,
		Chip,
		CustomItem,
		DatetimeInputItem,
		InputItem,
		Modal,
		MultiSelectInputItem
	} from '$lib/components/core';
	import { IconLabel } from '$lib/components/core/display';
	import { t } from '$lib/locales';
	import { type Colors, Form, type FormActions, type ItemSlidingOption, type MultiSelectItem } from '$lib/models/ui';
	import {
		confirmationModal,
		customForm,
		formatter,
		getBudgetCategoryNameById,
		getPersonOfOrganizationId,
		getUsernameByPersonOfOrganizationId,
		getValidationResult,
		hasOrganizationRole,
		withLoader
	} from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		personsOfOrganization: PersonOfOrganizationTO[];
		posting: PostingTO;
		activity?: ActivityTO;
		color?: Colors;
		onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
		onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
		onEditEnd: (dismissParent?: boolean) => void;
		onEditStart: () => void;
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
		completed?: () => Promise<void>;
	};

	type PostingFormModel = PostingCreateUpdateRequestTO & { activityId: number };

	let {
		activities,
		activity,
		budgetCategories,
		color = 'light',
		completed,
		onDeleteActivityPosting,
		onDeleteOrganizationPosting,
		onEditEnd,
		onEditStart,
		onTransferActivityPosting,
		onTransferOrganizationPosting,
		onUpdateActivityPosting,
		onUpdateOrganizationPosting,
		personsOfOrganization,
		posting
	}: Properties = $props();

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));
	const canEdit = $derived(isManager || posting.personOfOrganizationId === getPersonOfOrganizationId());
	const canTransfer = $derived(isManager && posting.personOfOrganizationId > 0);
	const activityId = $derived(activity?.id ?? 0);

	let modalOpen = $state<boolean>(false);
	let selectedPostingType = $derived<PostingType>(posting.type);
	let formActions = $state<FormActions<PostingFormModel>>();
	let loading = $state<boolean>(true);

	const postingFormSchema: ObjectSchema<PostingCreateUpdateRequestTO & { activityId: number }> =
		createUpdatePostingSchema().shape({
			activityId: number().default(0)
		});

	const budgetCategoryItems = $derived<MultiSelectItem[]>(
		budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: category.defaultCategory
		}))
	);

	const personOfOrganizationItems = $derived<MultiSelectItem[]>(
		personsOfOrganization.map((personOfOrganization) => ({
			data: { id: personOfOrganization.id, label: personOfOrganization.username },
			selected: personOfOrganization.id === posting.personOfOrganizationId
		}))
	);

	const activityItems = $derived<MultiSelectItem[]>(
		activities.map((activityItem) => ({
			data: { id: activityItem.id, label: activityItem.name },
			selected: activityItem.id === activityId
		}))
	);

	const form = new Form({
		actions: (actions) => (formActions = actions),
		completed: async ({ actions }) => {
			await completed?.();
			modalOpen = false;
			loading = true;
			onEditEnd();
			actions.set(postingFormSchema.getDefault());
		},
		failed: () => {
			modalOpen = false;
			loading = true;
			onEditEnd();
		},
		request: (model) =>
			model.activityId > 0
				? onUpdateActivityPosting(model.activityId, posting.id, model)
				: onUpdateOrganizationPosting(posting.id, model),
		schema: postingFormSchema
	});

	const slidingOptions = $derived.by(() => {
		const options: ItemSlidingOption[] = [];

		if (canEdit) {
			options.push(
				{
					color: 'danger',
					handler: () => onDeletePosting(),
					icon: trashBinOutline,
					label: $t('components.posting-item.sliding-options.delete')
				},
				{
					color: 'primary',
					handler: () => (modalOpen = true),
					icon: createOutline,
					label: $t('components.posting-item.sliding-options.edit')
				}
			);
		}

		if (canTransfer) {
			options.push({
				color: 'tertiary',
				handler: () => onTransferPosting(),
				icon: sendOutline,
				label: $t('components.posting-item.sliding-options.transfer')
			});
		}

		return options;
	});

	async function onModalPresented(): Promise<void> {
		onEditStart();
		selectedPostingType = posting.type;
		loading = false;
		await tick();
		formActions?.set(
			postingFormSchema.cast({
				...posting,
				activityId
			} satisfies PostingFormModel)
		);
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		formActions?.patchByKey('type', type);
	}

	async function onDeletePosting(): Promise<void> {
		await confirmationModal({
			confirmText: $t('components.posting-item.modal.delete.confirm'),
			handler: deletePosting
		});
	}

	async function deletePosting(): Promise<void> {
		await withLoader(async () => {
			const result =
				activityId > 0
					? await onDeleteActivityPosting(activityId, posting.id)
					: await onDeleteOrganizationPosting(posting.id);
			const validationResult = getValidationResult(result);
			if (validationResult.valid) {
				await completed?.();
			}
		});
	}

	async function onTransferPosting(): Promise<void> {
		await confirmationModal({
			confirmText: $t('components.posting-item.modal.transfer.confirm'),
			handler: transferPosting,
			header: $t('components.posting-item.modal.transfer.header'),
			message: $t('components.posting-item.modal.transfer.message')
		});
	}

	async function transferPosting(): Promise<void> {
		await withLoader(async () => {
			const result =
				activityId > 0
					? await onTransferActivityPosting(activityId, posting.id)
					: await onTransferOrganizationPosting(posting.id);
			const validationResult = getValidationResult(result);
			if (validationResult.valid) {
				await completed?.();
			}
		});
	}

	async function onOpenActivity(): Promise<void> {
		if (activity) {
			onDismissed(true);
			await goto(resolve('/organization/activities/[slug]', { slug: activity.id.toString() }));
		}
	}

	function onDismissed(dismissParent?: boolean): void {
		modalOpen = false;
		loading = true;
		onEditEnd(dismissParent);
	}
</script>

<CustomItem
	{color}
	slidingOptions={slidingOptions.length > 0 ? slidingOptions : undefined}
	iconColor={posting.type === 'CREDIT' ? 'success' : 'danger'}
	icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
>
	<div class="mt-2 flex w-full flex-col items-center gap-1 text-sm">
		<div class="flex w-full items-center justify-between gap-1">
			<ion-text class="truncate font-semibold">{posting.purpose}</ion-text>
			<ion-text color={posting.type === 'CREDIT' ? 'success' : 'danger'} class="font-bold text-nowrap">
				{posting.type === 'CREDIT' ? '+' : '-'}
				{formatter.currency(posting.amountInCents)}
			</ion-text>
		</div>
		<div class="flex w-full flex-row items-center justify-start gap-2 overflow-hidden">
			<IconLabel
				icon={calendarClearOutline}
				label={format(new TZDate(posting.date), 'PP')}
				size="xs"
				classList="shrink-0"
				align="start"
			/>
			<IconLabel
				icon={cardOutline}
				label={getBudgetCategoryNameById(posting.organizationBudgetCategoryId)}
				size="xs"
				align="start"
			/>
		</div>
		<div class="flex w-full flex-row items-center justify-start gap-2 overflow-hidden">
			{#if activity}
				<IconLabel icon={flashOutline} label={activity.name} size="xs" classList="min-w-0" align="start" />
			{/if}
			{#if posting.personOfOrganizationId > 0}
				<IconLabel
					icon={personOutline}
					label={getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)!}
					size="xs"
					classList={activity ? 'min-w-0 shrink-0 max-w-[50%]' : ''}
					align="start"
				/>
			{/if}
		</div>
	</div>
</CustomItem>

{#if canEdit}
	<Modal open={modalOpen} dismissed={() => onDismissed()} lazy presented={onModalPresented} {loading}>
		<Card title={$t('components.posting-item.modal.edit.title')}>
			<form use:customForm={form}>
				<div class="mb-3 flex items-center justify-center gap-2">
					<Chip
						selected={selectedPostingType === 'CREDIT'}
						label={$t('components.posting-item.modal.edit.credit')}
						clicked={() => setSelectedPostingType('CREDIT')}
					/>
					<Chip
						selected={selectedPostingType === 'DEBIT'}
						label={$t('components.posting-item.modal.edit.debit')}
						clicked={() => setSelectedPostingType('DEBIT')}
					/>
				</div>
				<InputItem name="purpose" label={$t('components.posting-item.modal.edit.purpose')} icon={documentOutline} />
				<AmountInputItem name="amountInCents" label={$t('components.posting-item.modal.edit.amount')} />
				<DatetimeInputItem name="date" label={$t('components.posting-item.modal.edit.date')} />
				<MultiSelectInputItem
					hidden={posting.personOfOrganizationId === 0}
					readonly={!isManager}
					name="personOfOrganizationId"
					icon={peopleOutline}
					multiple={false}
					label={$t('components.posting-item.modal.edit.member.label')}
					noneSelectedText={$t('components.posting-item.modal.edit.member.none-selected')}
					items={personOfOrganizationItems}
				/>
				<MultiSelectInputItem
					hidden={!activity}
					name="activityId"
					icon={flashOutline}
					iconEnd={openOutline}
					iconClicked={onOpenActivity}
					multiple={false}
					readonly
					label={$t('components.posting-item.modal.edit.activity.label')}
					noneSelectedText={$t('components.posting-item.modal.edit.activity.none-selected')}
					items={activityItems}
				/>
				<MultiSelectInputItem
					name="organizationBudgetCategoryId"
					icon={cardOutline}
					multiple={false}
					label={$t('components.posting-item.modal.edit.budget-category.label')}
					items={budgetCategoryItems}
				/>
			</form>
		</Card>
	</Modal>
{/if}
