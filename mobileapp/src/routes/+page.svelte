<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';
	import type { KollappUserTO, OrganizationTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		calendarOutline,
		flashOutline,
		notificationsOffOutline,
		peopleOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Layout from '$lib/components/layout/Layout.svelte';
	import BudgetChart from '$lib/components/widgets/BudgetChart.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import { featureNotImplementedAlert, getDateFnsLocale } from '$lib/utility';

	const activity = $derived($organizationStore?.activities && $organizationStore.activities[0]);
	const postings = $derived($organizationStore ? $organizationStore.activities.flatMap((a) => a.activityPostings) : []);

	function onNavigateEvent(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(resolve('/organization/activities/[slug]', { slug: $organizationStore.activities[0].id.toString() }));
		}
	}
</script>

<Layout title={$t('routes.home.title')}>
	{#if $userStore}
		{@render accountCard($userStore)}
		{#if $organizationStore}
			{#if activity}
				{@render upcomingEventCard(activity)}
			{/if}
			{@render organizationCard($organizationStore)}
			{@render budgetChartCard()}
		{:else}
			{@render noCollectiveCards()}
		{/if}
	{/if}
</Layout>

{#snippet accountCard(user: KollappUserTO)}
	<Card color="transparent" classList="text-center" clicked={() => goto(resolve('/account'))}>
		<div class="truncate">
			<ion-text class="text-2xl" color="dark">
				{$t('routes.home.card.user.title', { value: user.username })}
			</ion-text>
		</div>
		<Button
			fill="clear"
			color="medium"
			size="small"
			icon={notificationsOffOutline}
			label={$t('routes.home.card.notifications.no-notes')}
			clicked={featureNotImplementedAlert}
		/>
	</Card>
{/snippet}

{#snippet upcomingEventCard(activity: ActivityModel)}
	<Card title="Upcoming event" border="secondary" clicked={onNavigateEvent}>
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
	<Card border="primary" title={organization.name} clicked={() => goto(resolve('/organization'))}>
		<div class="flex flex-wrap items-center justify-center gap-2">
			<Button
				size="small"
				fill="solid"
				color="light"
				icon={peopleOutline}
				label={`${organization.personsOfOrganization.length} members`}
				clicked={(_event) => goto(resolve('/organization/members'))}
			/>
			<Button
				icon={flashOutline}
				label={`${$organizationStore?.activities.length ?? 0} activities`}
				size="small"
				fill="solid"
				color="light"
				clicked={(_event) => goto(resolve('/organization/activities'))}
			/>
		</div>
	</Card>
{/snippet}

{#snippet noCollectiveCards()}
	<Card title={$t('routes.home.card.register-organization.title')} classList="text-center">
		<Button
			clicked={(_event) => _event?.stopPropagation() && goto(resolve('/organization/register'))}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.register')}
		/>
	</Card>
	<Card title={$t('routes.home.card.join-organization.title')} classList="text-center">
		<Button
			clicked={(_event) => _event?.stopPropagation() && goto(resolve('/organization/join'))}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.join')}
		/>
	</Card>
{/snippet}

{#snippet budgetChartCard()}
	<BudgetChart {postings} />
{/snippet}
