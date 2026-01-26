<script lang="ts">
	import type { ActivityTO, KollappUserTO, OrganizationTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		arrowForwardOutline,
		calendarClearOutline,
		cardOutline,
		cashOutline,
		flashOutline,
		notificationsOffOutline,
		peopleOutline,
		personAddOutline,
		warningOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import BudgetChart from '$lib/components/widgets/BudgetChart.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import PostingOverviewModal from '$lib/components/widgets/PostingOverviewModal.svelte';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import { getDateFnsLocale, hasOrganizationRole, triggerClickByLabel } from '$lib/utility';

	let transactionOverviewOpen = $state<boolean>(false);

	const activity = $derived.by(() => {
		if (!$organizationStore?.activities || $organizationStore.activities.length === 0) {
			return;
		}
		const sorted = $organizationStore.activities.toSorted(
			(a, b) => new TZDate(a.date).getTime() - new TZDate(b.date).getTime()
		);
		const upcoming = sorted.find((a) => new TZDate(a.date).getTime() > TZDate.now());
		return upcoming;
	});

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

	function onNavigateActivity(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(resolve('/organization/activities/[slug]', { slug: $organizationStore.activities[0].id.toString() }));
		}
	}

	async function onAddPosting(): Promise<void> {
		await goto(resolve('/organization'));
		await triggerClickByLabel($t('routes.organization.page.budget-card.card.add-posting'));
	}

	async function onCreateActivity(): Promise<void> {
		await goto(resolve('/organization'));
		await triggerClickByLabel($t('routes.organization.page.activity-list.list.create-activity'));
	}

	async function onAddBudgetCategory(): Promise<void> {
		await goto(resolve('/organization/budget-categories'));
		await triggerClickByLabel(
			$t('routes.organization.budget-categories.page.budget-categories-card.card.add-category')
		);
	}

	async function onAddPersonOfOrganization(): Promise<void> {
		await goto(resolve('/organization/members'));
		await triggerClickByLabel($t('routes.organization.members.page.fab.invite-members.title'));
	}
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
			{#if activity}
				{@render upcomingActivityCard(activity)}
			{/if}
			{@render organizationCard($organizationStore)}
			{@render quickAccess()}
			{@render budgetChartCard()}
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

{#snippet upcomingActivityCard(activity: ActivityTO)}
	<Card
		tourId={TourStepId.HOME.UPCOMING_ACTIVITY}
		title={$t('routes.page.page.upcoming-activity-card.card.title')}
		border="secondary"
		clicked={onNavigateActivity}
		titleIconEnd={arrowForwardOutline}
	>
		<div class="flex flex-wrap items-center justify-center gap-2 text-sm">
			<div class="flex items-center gap-1">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activity.name}</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(new TZDate(activity.date), {
						addSuffix: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text>{activity.activityPostings.length}</ion-text>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet organizationCard(organization: OrganizationTO)}
	<Card
		border="primary"
		title={organization.name}
		clicked={() => goto(resolve('/organization'))}
		titleIconEnd={arrowForwardOutline}
		tourId={TourStepId.HOME.ORGANIZATION}
	>
		<ion-note class="flex flex-wrap items-center justify-center gap-2 text-sm">
			<div class="flex items-center gap-1">
				<ion-icon icon={peopleOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.members', {
						value: organization.personsOfOrganization.length
					})}
				</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.activities', {
						value: $organizationStore?.activities.length ?? 0
					})}
				</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.postings', {
						value:
							($organizationStore?.organizationPostings.length ?? 0) +
							($organizationStore?.activities.reduce(
								(total, activity) => total + activity.activityPostings.length,
								0
							) ?? 0)
					})}
				</ion-text>
			</div>
		</ion-note>
	</Card>
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
	<div data-tour={TourStepId.HOME.QUICK_ACCESS} class="grid grid-cols-2">
		<Card
			titleIconStart={cashOutline}
			classList={isManager ? 'text-center' : 'text-center col-span-2'}
			clicked={onAddPosting}
			border="tertiary"
		>
			<ion-text>{$t('routes.page.page.quick-access.card.add-posting')}</ion-text>
		</Card>
		{#if isManager}
			<Card titleIconStart={flashOutline} classList="text-center" clicked={onCreateActivity} border="tertiary">
				<ion-text>{$t('routes.page.page.quick-access.card.create-activity')}</ion-text>
			</Card>
			<Card titleIconStart={cardOutline} classList="text-center" clicked={onAddBudgetCategory} border="tertiary">
				<ion-text>{$t('routes.page.page.quick-access.card.budget-categories')}</ion-text>
			</Card>
			<Card
				titleIconStart={personAddOutline}
				classList="text-center"
				clicked={onAddPersonOfOrganization}
				border="tertiary"
			>
				<ion-text>{$t('routes.page.page.quick-access.card.invite-person-of-organization')}</ion-text>
			</Card>
		{/if}
	</div>
{/snippet}

{#snippet budgetChartCard()}
	<BudgetChart {postings} tourId={TourStepId.HOME.BUDGET_CHART} />
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
