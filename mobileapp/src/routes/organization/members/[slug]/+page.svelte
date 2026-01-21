<script lang="ts">
	import type {
		OrganizationRole,
		PersonOfOrganizationTO,
		PostingCreateUpdateRequestTO,
		PostingTO,
		PostingType
	} from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, loadingController } from '@ionic/core';
	import { format } from 'date-fns';
	import {
		cardOutline,
		cashOutline,
		createOutline,
		documentOutline,
		medalOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		sendOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';

	import { budgetService, organizationService } from '$lib/api/services';
	import { createUpdatePostingSchema } from '$lib/api/validation/budget';
	import Layout from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions, type ItemSlidingOption } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';
	import {
		confirmationModal,
		customForm,
		formatter,
		getRoleTranslationFromRole,
		getValidationResult,
		hasOrganizationRole,
		parser
	} from '$lib/utility';

	const { data } = $props();

	const member = $derived<PersonOfOrganizationTO | undefined>(
		$organizationStore?.personsOfOrganization.find((p) => p.id === data.personOfOrganizationId)
	);

	const postings = $derived<PostingTO[]>([
		...($organizationStore?.organizationPostings ?? []),
		...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
	]);

	const memberPostings = $derived<PostingTO[]>(
		postings.filter((posting) => posting.personOfOrganizationId === data.personOfOrganizationId)
	);

	const openPostings = $derived<PostingTO[]>(memberPostings.filter((posting) => posting.personOfOrganizationId > 0));

	const totalCredit = $derived(
		memberPostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const totalDebit = $derived(
		memberPostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const balance = $derived(totalCredit - totalDebit);

	const roleLabel = $derived(member ? getRoleTranslationFromRole(member.organizationRole) : '');

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	let searchValue = $state<string>('');

	const filteredOpenPostings = $derived<PostingTO[]>(
		searchValue
			? openPostings.filter((posting) => posting.purpose.toLowerCase().includes(searchValue.toLowerCase().trim()))
			: openPostings
	);

	let postingUpdateModalOpen = $state<boolean>(false);
	let selectedPosting = $state<PostingTO>();
	let selectedPostingType = $state<PostingType>('DEBIT');
	let updatePostingFormActions = $state<FormActions<PostingCreateUpdateRequestTO>>();

	const updatePostingForm = new Form<PostingCreateUpdateRequestTO>({
		completed: async ({ actions }) => {
			await organizationStore.update($organizationStore?.id!);
			postingUpdateModalOpen = false;
			actions.setModel(createUpdatePostingSchema().getDefault());
		},
		exposedActions: (exposedActions) => (updatePostingFormActions = exposedActions),
		formatters: { amountInCents: formatter.currency },
		parsers: { amountInCents: parser.currency },
		request: async (model) => {
			const organizationId = $organizationStore?.id!;
			const postingId = selectedPosting?.id!;
			const activity = $organizationStore?.activities.find((activity) =>
				activity.activityPostings.some((activityPosting) => activityPosting.id === postingId)
			);
			return activity
				? budgetService.updateActivityPosting(organizationId, activity.id, postingId, model)
				: budgetService.updateOrganizationPosting(organizationId, postingId, model);
		},
		schema: createUpdatePostingSchema()
	});

	function getPostingSlidingOptions(posting: PostingTO): ItemSlidingOption[] {
		return [
			{
				color: 'primary',
				handler: () => onOpenUpdatePostingModal(posting),
				icon: createOutline
			},
			{
				color: 'tertiary',
				handler: () => onTransferPosting(posting),
				icon: sendOutline
			}
		];
	}

	function onOpenUpdatePostingModal(posting: PostingTO): void {
		selectedPosting = posting;
		selectedPostingType = posting.type;
		updatePostingFormActions?.setModel(
			createUpdatePostingSchema().cast({
				amountInCents: posting.amountInCents,
				date: posting.date,
				personOfOrganizationId: posting.personOfOrganizationId ?? 0,
				purpose: posting.purpose,
				type: posting.type
			}) as PostingCreateUpdateRequestTO
		);
		postingUpdateModalOpen = true;
	}

	function setSelectedPostingType(type: PostingType): void {
		selectedPostingType = type;
		updatePostingFormActions?.setModel({
			...updatePostingForm.model,
			type
		});
	}

	async function onSelectRole(): Promise<void> {
		if (!member) return;
		const organizationId = $organizationStore?.id!;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => onGrantOrganizationRolePrompt(member.id, organizationId, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: member.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () => onGrantOrganizationRolePrompt(member.id, organizationId, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: member.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function onGrantOrganizationRolePrompt(
		memberId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		if (role === member?.organizationRole) {
			return;
		}
		await confirmationModal({
			handler: async () => await grantOrganizationRole(memberId, organizationId, role),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}

	async function grantOrganizationRole(
		memberId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		await organizationService.grantRole(organizationId, memberId, role);
		await organizationStore.update(organizationId);
	}

	async function onTransferPosting(posting: PostingTO): Promise<void> {
		await confirmationModal({
			handler: () => transferPosting(posting),
			header: $t('routes.organization.members.slug.page.modal.transfer-posting.header'),
			message: $t('routes.organization.members.slug.page.modal.transfer-posting.message')
		});
	}

	async function transferPosting(posting: PostingTO): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id!;
		const activity = $organizationStore?.activities.find((a) => a.activityPostings.some((ap) => ap.id === posting.id));
		const result = activity
			? getValidationResult(await budgetService.transferActivityPosting(organizationId, activity.id, posting.id))
			: getValidationResult(await budgetService.transferOrganizationPosting(organizationId, posting.id));
		if (result.valid) {
			await organizationStore.update(organizationId);
		}
		await loader.dismiss();
	}

	function onSearch(event: CustomEvent): void {
		searchValue = event.detail.value ?? '';
	}
</script>

<Layout title={$t('routes.organization.members.slug.page.title')} showBackButton>
	{#if member}
		{@render memberHeader()}
		{@render infoCard()}
		{#if isManager}
			{@render postingsOverviewCard()}
			{#if openPostings.length > 0}
				{@render openPostingsCard()}
			{/if}
		{/if}
	{:else}
		{@render notFound()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet memberHeader()}
	<div class="flex flex-col items-center gap-4 py-4">
		<ion-icon color="medium" icon={personCircleOutline} class="h-24 w-24"></ion-icon>
		<h1 class="text-2xl font-bold">{member!.username}</h1>
	</div>
{/snippet}

{#snippet infoCard()}
	<Card title={$t('routes.organization.members.slug.page.card.info.title')}>
		<CustomItem clicked={onSelectRole} icon={ribbonOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.info.role')}</ion-label>
				<ion-text>{roleLabel}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet postingsOverviewCard()}
	<Card title={$t('routes.organization.members.slug.page.card.postings.title')}>
		<CustomItem icon={cashOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.total')}</ion-label>
				<ion-text>{memberPostings.length}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={trendingUpOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.credit')}</ion-label>
				<ion-text color="success">{formatter.currency(totalCredit)}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={trendingDownOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.debit')}</ion-label>
				<ion-text color="danger">{formatter.currency(totalDebit)}</ion-text>
			</div>
		</CustomItem>
		<CustomItem icon={cardOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.balance')}</ion-label>
				<ion-text color={balance >= 0 ? 'success' : 'danger'}>{formatter.currency(balance)}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet openPostingsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.open-postings.title')}>
		<ion-searchbar
			debounce={100}
			placeholder={$t('routes.organization.members.slug.page.card.open-postings.search-placeholder')}
			onionInput={onSearch}
			value={searchValue}
		></ion-searchbar>
		{#each filteredOpenPostings as posting (posting.id)}
			{@render postingItem(posting)}
		{/each}
		{#if filteredOpenPostings.length === 0 && searchValue}
			{@render noSearchResults()}
		{/if}
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	<CustomItem
		icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
		slidingOptions={getPostingSlidingOptions(posting)}
	>
		<div class="flex w-full items-center justify-between">
			<div class="flex flex-col">
				<ion-text class="font-medium">{posting.purpose}</ion-text>
				<ion-note class="ms-2 text-xs">
					{format(new TZDate(posting.date), 'PP')}
				</ion-note>
			</div>
			<ion-text color={posting.type === 'CREDIT' ? 'success' : 'danger'}>
				{formatter.currency(posting.amountInCents)}
			</ion-text>
		</div>
	</CustomItem>
{/snippet}

{#snippet noSearchResults()}
	<div class="flex items-center justify-center py-4">
		<ion-text>
			{$t('routes.organization.members.slug.page.card.open-postings.no-results', {
				value: searchValue.trim()
			})}
		</ion-text>
	</div>
{/snippet}

{#snippet notFound()}
	<div class="flex h-full items-center justify-center">
		<ion-text>{$t('routes.organization.members.slug.page.not-found')}</ion-text>
	</div>
{/snippet}

<!-- Modals -->

<!-- Update Posting Modal -->
<Modal open={postingUpdateModalOpen} dismissed={() => (postingUpdateModalOpen = false)}>
	<Card title={$t('routes.organization.members.slug.page.modal.update-posting.title')}>
		<form use:customForm={updatePostingForm}>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Chip
					selected={selectedPostingType === 'CREDIT'}
					label={$t('routes.organization.members.slug.page.modal.update-posting.credit')}
					clicked={() => setSelectedPostingType('CREDIT')}
				/>
				<Chip
					selected={selectedPostingType === 'DEBIT'}
					label={$t('routes.organization.members.slug.page.modal.update-posting.debit')}
					clicked={() => setSelectedPostingType('DEBIT')}
				/>
			</div>
			<InputItem
				name="purpose"
				label={$t('routes.organization.members.slug.page.modal.update-posting.purpose')}
				icon={documentOutline}
			/>
			<AmountInputItem
				name="amountInCents"
				label={$t('routes.organization.members.slug.page.modal.update-posting.amount')}
			/>
			<DatetimeInputItem name="date" label={$t('routes.organization.members.slug.page.modal.update-posting.date')} />
		</form>
	</Card>
</Modal>
