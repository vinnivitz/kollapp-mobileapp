<script lang="ts">
	import type { ActivityModel, OrganizationModel, UserModel } from '$lib/models/models';

	import { addDays, formatDistanceToNow } from 'date-fns';
	import { accessibilityOutline, calendarOutline, cashOutline, flashOutline, peopleOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import PieChart from '$lib/components/widgets/PieChart.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import { currencyFormatter, getDateFnsLocale } from '$lib/utility';

	const activity = $derived($organizationStore?.activities && $organizationStore.activities[0]);

	function onNavigateEvent(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL($organizationStore.activities[0].id));
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
			{@render notificationCard()}
		{:else}
			{@render noCollectiveCards()}
		{/if}
	{/if}
</Layout>

{#snippet accountCard(user: UserModel)}
	<Card classList="text-center" click={() => goto(PageRoute.ACCOUNT.ROOT)}>
		<ion-text class="text-2xl" color="dark"
			>members
			{$t('routes.home.card.user.title', { value: user.username })}
		</ion-text>
	</Card>
{/snippet}

{#snippet upcomingEventCard(activity: ActivityModel)}
	<Card title="Upcoming event" click={onNavigateEvent}>
		<div class="mb-3 flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activity.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new Date(), 5), {
						addSuffix: true,
						includeSeconds: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet organizationCard(organization: OrganizationModel)}
	<Card title={organization.name} click={() => goto(PageRoute.ORGANIZATION.ROOT)}>
		<div class="flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={peopleOutline}></ion-icon>
				<ion-text>{organization.personsOfOrganization.length} members</ion-text>
			</div>
			<div class="flex items-center justify-center gap-2">
				<ion-icon icon={cashOutline}></ion-icon>
				<ion-text>{currencyFormatter()(accountPostingsStore.getTotalBudget())}</ion-text>
			</div>
		</div>
		<div class="mt-3 text-center">
			<PieChart />
		</div>
	</Card>
{/snippet}

{#snippet notificationCard()}
	<Card title="Notifications" classList="text-center">
		<ion-text>{$t('routes.home.card.notifications.no-notes')}</ion-text>
	</Card>
{/snippet}

{#snippet noCollectiveCards()}
	<Card title={$t('routes.home.card.register-organization.title')} classList="text-center">
		<Button
			click={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.register')}
		/>
	</Card>
	<Card title={$t('routes.home.card.join-organization.title')} classList="text-center">
		<Button
			click={() => goto(PageRoute.ORGANIZATION.JOIN)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.join')}
		/>
	</Card>
{/snippet}
