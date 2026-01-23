<script lang="ts">
	import type { ActivityTO, KollappUserTO, OrganizationTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { addDays, formatDistanceToNow } from 'date-fns';
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

	import Layout from '$lib/components/layout/Layout.svelte';
	import BudgetChart from '$lib/components/widgets/BudgetChart.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/tour';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import { getDateFnsLocale, hasOrganizationRole, triggerClickByLabel } from '$lib/utility';

	const activity = $derived($organizationStore?.activities && $organizationStore.activities[0]);
	const postings = $derived(
		$organizationStore
			? [
					...$organizationStore.organizationPostings,
					...$organizationStore.activities.flatMap((activity) => activity.activityPostings)
				]
			: []
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
			fill="clear"
			color="medium"
			size="small"
			icon={notificationsOffOutline}
			label={$t('routes.page.page.account-card.notifications.no-notes')}
			clicked={() => goto(resolve('/account/notifications'))}
		/>
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
		<div class="mb-3 flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activity.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new TZDate(), 5), {
						addSuffix: true,
						includeSeconds: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
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
		<div class="flex flex-wrap items-center justify-center gap-2">
			<Button
				size="small"
				fill="solid"
				color="light"
				icon={peopleOutline}
				label={$t('routes.page.page.organization-card.card.members', {
					value: organization.personsOfOrganization.length
				})}
				clicked={() => goto(resolve('/organization/members'))}
			/>
			<Button
				icon={flashOutline}
				label={$t('routes.page.page.organization-card.card.activities', {
					value: $organizationStore?.activities.length ?? 0
				})}
				size="small"
				fill="solid"
				color="light"
				clicked={() => goto(resolve('/organization/activities'))}
			/>
		</div>
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
	<div data-tour={TourStepId.HOME.QUICK_ACCESS} class="flex flex-col gap-2">
		<div class="mx-3 flex items-center justify-center gap-2">
			<Button
				classList="flex-1"
				clicked={onAddPosting}
				expand="block"
				shape="square"
				fill="outline"
				color="tertiary"
				label={$t('routes.page.page.new-posting-button.label')}
				icon={cashOutline}
			/>
			{#if isManager}
				<Button
					classList="flex-1"
					clicked={onCreateActivity}
					expand="block"
					shape="square"
					fill="outline"
					color="tertiary"
					label={$t('routes.page.page.create-activity-button.label')}
					icon={flashOutline}
				/>
			{/if}
		</div>
		{#if isManager}
			<div class="mx-3 flex items-center justify-center gap-2">
				<Button
					classList="flex-1"
					clicked={onAddBudgetCategory}
					expand="block"
					shape="square"
					fill="outline"
					color="tertiary"
					label={$t('routes.page.page.budget-categories-button.label')}
					icon={cardOutline}
				/>
				<Button
					classList="flex-1"
					clicked={onAddPersonOfOrganization}
					expand="block"
					shape="square"
					fill="outline"
					color="tertiary"
					label={$t('routes.page.page.person-of-organization-button.label')}
					icon={personAddOutline}
				/>
			</div>
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
