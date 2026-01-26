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
	import { loadingController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		calendarClearOutline,
		cardOutline,
		createOutline,
		documentOutline,
		flashOutline,
		peopleOutline,
		personOutline,
		sendOutline,
		trashBinOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { number } from 'yup';

	import AmountInputItem from '../ionic/AmountInputItem.svelte';
	import Card from '../ionic/Card.svelte';
	import Chip from '../ionic/Chip.svelte';
	import CustomItem from '../ionic/CustomItem.svelte';
	import DatetimeInputItem from '../ionic/DatetimeInputItem.svelte';
	import InputItem from '../ionic/InputItem.svelte';
	import Modal from '../ionic/Modal.svelte';
	import MultiSelectInputItem from '../ionic/MultiSelectInputItem.svelte';

	import { createUpdatePostingSchema } from '$lib/api/schema/budget';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption, type MultiSelectItem } from '$lib/models/ui';
	import {
		confirmationModal,
		customForm,
		formatter,
		getBudgetCategoryNameById,
		getOrganizationId,
		getPersonOfOrganizationId,
		getUsernameByPersonOfOrganizationId,
		getValidationResult,
		hasOrganizationRole,
		parser
	} from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		personsOfOrganization: PersonOfOrganizationTO[];
		posting: PostingTO;
		activity?: ActivityTO;
		onDeleteActivityPosting: (activityId: number, postingId: number) => Promise<ResponseBody>;
		onDeleteOrganizationPosting: (postingId: number) => Promise<ResponseBody>;
		onEditEnd: () => void;
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
		onCompleted?: () => Promise<void>;
	};

	type PostingFormModel = PostingCreateUpdateRequestTO & { activityId: number };

	let {
		activities,
		activity,
		budgetCategories,
		onCompleted,
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

	const organizationId = getOrganizationId();
	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));
	const canEdit = $derived(isManager || posting.personOfOrganizationId === getPersonOfOrganizationId());
	const canTransfer = $derived(isManager && posting.personOfOrganizationId > 0);
	const activityId = activity?.id ?? 0;

	let editModalOpen = $state<boolean>(false);
	let selectedPostingType = $state<PostingType>(posting.type);
	let formActions = $state<FormActions<PostingFormModel>>();

	const postingFormSchema = createUpdatePostingSchema().shape({
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

	const updatePostingForm = new Form<PostingFormModel>({
		completed: async ({ actions }) => {
			await onCompleted?.();
			editModalOpen = false;
			actions.setModel(postingFormSchema.getDefault());
		},
		exposedActions: (exposedActions) => (formActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
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
					handler: onOpenEditModal,
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

	function onOpenEditModal(): void {
		onEditStart();
		selectedPostingType = posting.type;
		formActions?.setModel(
			postingFormSchema.cast({
				...posting,
				activityId
			} satisfies PostingFormModel)
		);
		editModalOpen = true;
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		formActions?.updateModelByKey('type', type);
	}

	async function onDeletePosting(): Promise<void> {
		await confirmationModal({
			confirmText: $t('components.posting-item.modal.delete.confirm'),
			handler: deletePosting
		});
	}

	async function deletePosting(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		if (organizationId) {
			const result =
				activityId > 0
					? await onDeleteActivityPosting(activityId, posting.id)
					: await onDeleteOrganizationPosting(posting.id);
			const validationResult = getValidationResult(result);
			if (validationResult.valid) {
				await onCompleted?.();
			}
		}
		await loader.dismiss();
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
		const loader = await loadingController.create({});
		await loader.present();
		if (organizationId) {
			const result =
				activityId > 0
					? await onTransferActivityPosting(activityId, posting.id)
					: await onTransferOrganizationPosting(posting.id);
			const validationResult = getValidationResult(result);
			if (validationResult.valid) {
				await onCompleted?.();
			}
		}
		await loader.dismiss();
	}

	function onDismissed(): void {
		editModalOpen = false;
		onEditEnd();
	}
</script>

<CustomItem
	{slidingOptions}
	iconColor={posting.type === 'CREDIT' ? 'success' : 'danger'}
	icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
>
	<div class="mt-2 flex w-full flex-col items-center gap-1">
		<div class="flex w-full items-center justify-between gap-1">
			<ion-text class="truncate font-semibold">{posting.purpose}</ion-text>
			<ion-text color={posting.type === 'CREDIT' ? 'success' : 'danger'} class="font-bold text-nowrap">
				{posting.type === 'CREDIT' ? '+' : '-'}
				{formatter.currency(posting.amountInCents)}
			</ion-text>
		</div>
		<div class="flex w-full flex-row items-center justify-start gap-2">
			<ion-note class="flex items-center justify-center gap-1 text-sm">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-label class="truncate">{format(new TZDate(posting.date), 'PP')}</ion-label>
			</ion-note>
			<ion-note class="flex items-center justify-center gap-1 text-sm">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-label class="truncate">{getBudgetCategoryNameById(posting.organizationBudgetCategoryId)}</ion-label>
			</ion-note>
		</div>
		<div class="flex w-full flex-row items-center justify-start gap-2">
			{#if activity}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={flashOutline}></ion-icon>
					<div class="truncate">{activity.name}</div>
				</ion-note>
			{/if}
			{#if posting.personOfOrganizationId > 0}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={personOutline}></ion-icon>
					<div class="truncate">{getUsernameByPersonOfOrganizationId(posting.personOfOrganizationId)}</div>
				</ion-note>
			{/if}
		</div>
	</div>
</CustomItem>

{#if canEdit}
	<Modal open={editModalOpen} dismissed={onDismissed}>
		<Card title={$t('components.posting-item.modal.edit.title')}>
			<form use:customForm={updatePostingForm}>
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
