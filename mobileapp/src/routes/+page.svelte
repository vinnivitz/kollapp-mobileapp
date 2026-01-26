<script lang="ts">
	import type { KollappUserTO } from '@kollapp/api-types';

	import {
		accessibilityOutline,
		arrowForwardOutline,
		cardOutline,
		notificationsOffOutline,
		personAddOutline,
		warningOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import PostingOverviewModal from '$lib/components/widgets/budget/PostingOverviewModal.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import QuickAccessGrid from '$lib/components/widgets/quick-access/QuickAccessGrid.svelte';
	import { t } from '$lib/locales';
	import { organizationStore, userStore } from '$lib/stores';
	import { hasOrganizationRole } from '$lib/utility';

	let transactionOverviewOpen = $state<boolean>(false);

	const personOfOrganizationId = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.id ?? 0
	);

	const postings = $derived(
		$organizationStore
			? [
					...$organizationStore.organizationPostings,
					...$organizationStore.activities.flatMap((activity) => activity.activityPostings)
				]
			: []
	);

	const userPostings = $derived(
		postings.filter((posting) => posting.personOfOrganizationId === personOfOrganizationId)
	);
	const organizations = $derived(organizationStore.organizations);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));
</script>

<Layout title={$t('routes.page.page.title')}>
	{#if $userStore}
		{@render accountCard($userStore)}

		{#if !$organizationStore && $organizations.length > 0}
			{@render pendingOrganizationJoinRequestCard()}
		{/if}

		{#if $organizationStore?.personsOfOrganization.some((person) => person.status === 'PENDING') && isManager}
			{@render pendingMembers()}
		{/if}

		{#if $organizationStore}
			{@render quickAccess()}
		{:else if $organizations.length === 0}
			{@render noCollectivesCard()}
		{/if}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet accountCard(user: KollappUserTO)}
	<div class="text-center">
		<div class="truncate">
			<ion-text class="text-2xl font-bold">
				{$t('routes.page.page.account-card.greetings', { value: user.username })}
			</ion-text>
		</div>
		<Button
			size="small"
			fill="clear"
			color="medium"
			icon={notificationsOffOutline}
			label={$t('routes.page.page.account-card.notifications.no-notes')}
			clicked={() => goto(resolve('/account/notifications'))}
		/>
		{#if userPostings.length > 0}
			<Button
				size="small"
				icon={cardOutline}
				fill="outline"
				label={$t('routes.page.page.account-card.open-postings.button.label', { value: userPostings.length })}
				clicked={() => (transactionOverviewOpen = true)}
			/>
		{/if}
	</div>
{/snippet}

{#snippet noCollectivesCard()}
	<Card border="warning" classList="text-center">
		<ion-note>{$t('routes.page.page.no-collectives-card.card.note')}</ion-note>
		<div class="mt-3 flex flex-col gap-3">
			<Button
				expand="block"
				clicked={() => goto(resolve('/organization/register'))}
				icon={accessibilityOutline}
				iconEnd={arrowForwardOutline}
				label={$t('routes.page.page.no-collectives-card.card.register')}
			/>
			<Button
				expand="block"
				clicked={() => goto(resolve('/organization/join'))}
				icon={personAddOutline}
				iconEnd={arrowForwardOutline}
				label={$t('routes.page.page.no-collectives-card.card.join')}
			/>
		</div>
	</Card>
{/snippet}

{#snippet pendingOrganizationJoinRequestCard()}
	<Card border="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon color="warning" icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<div class="flex flex-col">
				<ion-text>{$t('routes.page.page.pending-organization-join-request-card.card.note')}</ion-text>
				<ul class="text-start">
					{#each $organizations as organization (organization.id)}
						<li class="font-bold">{organization.name}</li>
					{/each}
				</ul>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet quickAccess()}
	<QuickAccessGrid />
{/snippet}

{#snippet pendingMembers()}
	<Card
		clicked={() => goto(resolve('/organization/members'))}
		title={$t('routes.page.page.pending-requests.card.title')}
		titleIconEnd={arrowForwardOutline}
		border="warning"
	>
		<ion-text>{$t('routes.page.page.pending-requests.card.content')}</ion-text>
		<ul class="list-disc">
			{#each $organizationStore?.personsOfOrganization.filter((person) => person.status === 'PENDING') as user (user.id)}
				<li class="font-bold">{user.username}</li>
			{/each}
		</ul>
	</Card>
{/snippet}

<PostingOverviewModal
	open={transactionOverviewOpen}
	dismissed={() => (transactionOverviewOpen = false)}
	activities={$organizationStore?.activities!}
	budgetCategories={$organizationStore?.budgetCategories!}
	personsOfOrganization={$organizationStore?.personsOfOrganization!}
	postings={userPostings}
	showPersonOfOrganizationFilter={false}
	onCompleted={organizationStore.update}
	onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
	onUpdateActivityPosting={budgetService.updateActivityPosting}
	onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
	onTransferActivityPosting={budgetService.transferActivityPosting}
	onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
	onDeleteActivityPosting={budgetService.deleteActivityPosting}
/>
