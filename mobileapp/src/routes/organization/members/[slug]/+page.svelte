<script lang="ts">
	import type { ActivityTO, OrganizationRole, PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import {
		cardOutline,
		cashOutline,
		medalOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService, organizationService } from '$lib/api/services';
	import { Button, Card, CustomItem } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { PostingItem, PostingOverviewModal } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';
	import {
		confirmationModal,
		formatter,
		getRoleTranslationFromRole,
		hasOrganizationRole,
		withLoader
	} from '$lib/utility';

	const { data } = $props();

	const PREVIEW_COUNT = 4;

	const personOfOrganization = $derived(
		$organizationStore?.personsOfOrganization.find(
			(personOfOrganization) => personOfOrganization.id === data.personOfOrganizationId
		)
	);
	let isEditingPosting = $state<boolean>(false);
	let stablePostings = $state<PostingTO[]>([]);
	let postingOverviewModalOpen = $state<boolean>(false);

	const postings = $derived<PostingTO[]>(
		[
			...($organizationStore?.organizationPostings ?? []),
			...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
		].filter((posting) => posting.personOfOrganizationId === data.personOfOrganizationId)
	);

	const totalCredit = $derived(
		stablePostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const totalDebit = $derived(
		stablePostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const balance = $derived(totalCredit - totalDebit);

	const activityByPostingId = $derived.by(() => {
		const map = new SvelteMap<number, ActivityTO>();
		for (const activity of $organizationStore?.activities ?? []) {
			for (const activityPosting of activity.activityPostings ?? []) {
				map.set(activityPosting.id, activity);
			}
		}
		return map;
	});

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const previewPostings = $derived(
		[...stablePostings]
			.toSorted((a, b) => new TZDate(b.date).getTime() - new TZDate(a.date).getTime())
			.slice(0, PREVIEW_COUNT)
	);

	const hasMorePostings = $derived(stablePostings.length > PREVIEW_COUNT);

	$effect(() => {
		if (!isEditingPosting) {
			stablePostings = [...postings];
		}
	});

	$effect(() => {
		if (!personOfOrganization) {
			goto(resolve('/organization/members'));
		}
	});

	async function onSelectRole(): Promise<void> {
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => onGrantOrganizationRolePrompt(personOfOrganization?.id!, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: personOfOrganization?.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () => onGrantOrganizationRolePrompt(personOfOrganization?.id!, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: personOfOrganization?.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function onGrantOrganizationRolePrompt(personOfOrganizationId: number, role: OrganizationRole): Promise<void> {
		if (role === personOfOrganization?.organizationRole) return;
		await confirmationModal({
			handler: async () => void withLoader(() => organizationService.grantRole(personOfOrganizationId, role)),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}
</script>

<Layout title={$t('routes.organization.members.slug.page.title')} showBackButton>
	{@render header()}
	{@render infoCard()}
	{@render postingStatisticsCard()}
	{#if stablePostings.length > 0}
		{@render assignedPostingsCard()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet header()}
	<div class="flex flex-col items-center gap-4 py-4">
		<ion-icon color="medium" icon={personCircleOutline} class="h-24 w-24"></ion-icon>
		<h1 class="text-2xl font-bold">{personOfOrganization!.username}</h1>
	</div>
{/snippet}

{#snippet infoCard()}
	<Card title={$t('routes.organization.members.slug.page.card.info.title')}>
		<CustomItem clicked={isManager ? onSelectRole : undefined} icon={ribbonOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.info.role')}</ion-label>
				<ion-text>{getRoleTranslationFromRole(personOfOrganization?.organizationRole!)}</ion-text>
			</div>
		</CustomItem>
	</Card>
{/snippet}

{#snippet postingStatisticsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.postings.title')}>
		<CustomItem icon={cashOutline}>
			<div class="flex w-full items-center justify-between">
				<ion-label>{$t('routes.organization.members.slug.page.card.postings.total')}</ion-label>
				<ion-text>{stablePostings.length}</ion-text>
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

{#snippet assignedPostingsCard()}
	<Card title={$t('routes.organization.members.slug.page.card.open-postings.title')}>
		<ion-list role="feed">
			{#each previewPostings as posting (posting.id)}
				{@render postingItem(posting)}
			{/each}
		</ion-list>
		{#if hasMorePostings}
			<div class="mt-2 flex justify-center">
				<Button
					fill="outline"
					label={$t('routes.organization.members.slug.page.card.open-postings.show-all', {
						value: stablePostings.length
					})}
					clicked={() => (postingOverviewModalOpen = true)}
				/>
			</div>
		{/if}
	</Card>
{/snippet}

{#snippet postingItem(posting: PostingTO)}
	<PostingItem
		{posting}
		activity={activityByPostingId.get(posting.id)}
		activities={$organizationStore?.activities!}
		budgetCategories={$organizationStore?.budgetCategories!}
		personsOfOrganization={$organizationStore?.personsOfOrganization!}
		onEditStart={() => (isEditingPosting = true)}
		onEditEnd={() => (isEditingPosting = false)}
		onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
		onUpdateActivityPosting={budgetService.updateActivityPosting}
		onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
		onTransferActivityPosting={budgetService.transferActivityPosting}
		onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
		onDeleteActivityPosting={budgetService.deleteActivityPosting}
	/>
{/snippet}

<PostingOverviewModal
	open={postingOverviewModalOpen}
	dismissed={() => (postingOverviewModalOpen = false)}
	postings={stablePostings}
	activities={$organizationStore?.activities ?? []}
	budgetCategories={$organizationStore?.budgetCategories ?? []}
	personsOfOrganization={$organizationStore?.personsOfOrganization ?? []}
	onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
	onUpdateActivityPosting={budgetService.updateActivityPosting}
	onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
	onTransferActivityPosting={budgetService.transferActivityPosting}
	onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
	onDeleteActivityPosting={budgetService.deleteActivityPosting}
/>
