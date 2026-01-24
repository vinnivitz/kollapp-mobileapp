<script lang="ts">
	import type { ActivityTO, PostingCreateUpdateRequestTO, PostingTO, PostingType } from '@kollapp/api-types';

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

	import AmountInputItem from './ionic/AmountInputItem.svelte';
	import Card from './ionic/Card.svelte';
	import Chip from './ionic/Chip.svelte';
	import CustomItem from './ionic/CustomItem.svelte';
	import DatetimeInputItem from './ionic/DatetimeInputItem.svelte';
	import InputItem from './ionic/InputItem.svelte';
	import Modal from './ionic/Modal.svelte';
	import MultiSelectItem from './ionic/MultiSelectItem.svelte';

	import { createUpdatePostingSchema } from '$lib/api/schema/budget';
	import { budgetService } from '$lib/api/services';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption, type SelectItem } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import { confirmationModal, customForm, formatter, getValidationResult, parser } from '$lib/utility';

	type Properties = {
		budgetCategoryName: string;
		posting: PostingTO;
		activity?: ActivityTO;
		canDelete?: boolean;
		canEdit?: boolean;
		canTransfer?: boolean;
		showMemberSelect?: boolean;
		username?: string;
	};

	let {
		activity,
		budgetCategoryName,
		canDelete = false,
		canEdit = false,
		canTransfer = false,
		posting,
		showMemberSelect = false,
		username
	}: Properties = $props();

	let editModalOpen = $state<boolean>(false);
	let selectedPostingType = $state<PostingType>(posting.type);
	let formActions = $state<FormActions<PostingCreateUpdateRequestTO>>();

	const budgetCategoryItems = $derived<SelectItem[]>(
		$organizationStore?.budgetCategories.map((category) => ({
			data: { id: category.id, label: category.name },
			selected: category.id === posting.organizationBudgetCategoryId
		})) ?? []
	);

	const personOfOrganizationItems = $derived<SelectItem[]>(
		$organizationStore?.personsOfOrganization.map((person) => ({
			data: { id: person.id, label: person.username },
			selected: person.id === posting.personOfOrganizationId
		})) ?? []
	);

	const isAssignedToPersonOfOrganization = $derived(posting.personOfOrganizationId !== 0);

	const updatePostingForm = new Form<PostingCreateUpdateRequestTO>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			editModalOpen = false;
			actions.setModel(createUpdatePostingSchema().getDefault());
		},
		exposedActions: (exposedActions) => (formActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) => {
			const organizationId = $organizationStore?.id!;
			return activity?.id
				? budgetService.updateActivityPosting(organizationId, activity.id, posting.id, model)
				: budgetService.updateOrganizationPosting(organizationId, posting.id, model);
		},
		schema: createUpdatePostingSchema()
	});

	const slidingOptions = $derived.by((): ItemSlidingOption[] => {
		const options: ItemSlidingOption[] = [];

		if (canDelete) {
			options.push({
				color: 'danger',
				handler: () => onDeletePosting(),
				icon: trashBinOutline,
				label: $t('components.posting-item.sliding-options.delete')
			});
		}

		if (canEdit) {
			options.push({
				color: 'primary',
				handler: onOpenEditModal,
				icon: createOutline,
				label: $t('components.posting-item.sliding-options.edit')
			});
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
		selectedPostingType = posting.type;
		formActions?.setModel(
			createUpdatePostingSchema().cast({
				amountInCents: posting.amountInCents,
				date: posting.date,
				organizationBudgetCategoryId: posting.organizationBudgetCategoryId,
				personOfOrganizationId: posting.personOfOrganizationId ?? 0,
				purpose: posting.purpose,
				type: posting.type
			}) as PostingCreateUpdateRequestTO
		);
		editModalOpen = true;
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		formActions?.setModel({
			...updatePostingForm.model,
			type
		});
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
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const result = activity?.id
				? getValidationResult(await budgetService.removeActivityPosting(organizationId, activity.id, posting.id))
				: getValidationResult(await budgetService.removeOrganizationPosting(organizationId, posting.id));
			if (result.valid) {
				await organizationStore.update(organizationId);
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
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const result = activity?.id
				? getValidationResult(await budgetService.transferActivityPosting(organizationId, activity.id, posting.id))
				: getValidationResult(await budgetService.transferOrganizationPosting(organizationId, posting.id));
			if (result.valid) {
				await organizationStore.update(organizationId);
			}
		}
		await loader.dismiss();
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
				<ion-label>{format(new TZDate(posting.date), 'PP')}</ion-label>
			</ion-note>
			<ion-note class="flex items-center justify-center gap-1 text-sm">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-label class="truncate">{budgetCategoryName}</ion-label>
			</ion-note>
		</div>
		<div class="flex w-full flex-row items-center justify-start gap-2">
			{#if activity}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={flashOutline}></ion-icon>
					<div class="truncate">{activity.name}</div>
				</ion-note>
			{/if}
			{#if username}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={personOutline}></ion-icon>
					<div class="truncate">{username}</div>
				</ion-note>
			{/if}
		</div>
	</div>
</CustomItem>

<!-- Edit Posting Modal -->
{#if canEdit}
	<Modal open={editModalOpen} dismissed={() => (editModalOpen = false)}>
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
				<MultiSelectItem
					hidden={!showMemberSelect || !isAssignedToPersonOfOrganization}
					name="personOfOrganizationId"
					icon={peopleOutline}
					multiple={false}
					label={$t('components.posting-item.modal.edit.member.label')}
					noneSelectedText={$t('components.posting-item.modal.edit.member.none-selected')}
					items={personOfOrganizationItems}
				/>
				<MultiSelectItem
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
