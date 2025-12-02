<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';
	import type { KollappUserTO, OrganizationTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		arrowForwardOutline,
		calendarOutline,
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
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import { getDateFnsLocale } from '$lib/utility';

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

	function onNavigateEvent(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(resolve('/organization/activities/[slug]', { slug: $organizationStore.activities[0].id.toString() }));
		}
	}
</script>

<Layout title={$t('routes.page.page.title')}>
	{#if $userStore}
		{#if !$organizationStore && $organizations.length > 0}
			{@render pendingOrganizationJoinRequestCard()}
		{/if}

		{@render accountCard($userStore)}

		{#if $organizationStore}
			{#if activity}
				{@render upcomingEventCard(activity)}
			{/if}
			{@render organizationCard($organizationStore)}
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

{#snippet upcomingEventCard(activity: ActivityModel)}
	<Card
		title={$t('routes.page.page.upcoming-event-card.card.title')}
		border="secondary"
		clicked={onNavigateEvent}
		titleIconEnd={arrowForwardOutline}
	>
		<div class="mb-3 flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activity.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarOutline}></ion-icon>
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
			<ion-text>
				{$t('routes.page.page.pending-organization-join-request-card.card.note', { value: $organizations[0]?.name })}
			</ion-text>
		</div>
	</Card>
{/snippet}

{#snippet budgetChartCard()}
	<BudgetChart {postings} />
{/snippet}
