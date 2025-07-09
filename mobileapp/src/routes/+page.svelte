<script lang="ts">
	import type { ActivityModel, OrganizationModel, UserModel } from '$lib/models/models';

	import { TZDate } from '@date-fns/tz';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		calendarOutline,
		cashOutline,
		flashOutline,
		notificationsOffOutline,
		peopleOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute, type PageRoutePaths } from '$lib/models/routing';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import { featureNotImplementedAlert, formatter, getDateFnsLocale } from '$lib/utility';

	const activity = $derived($organizationStore?.activities && $organizationStore.activities[0]);

	function onNavigateEvent(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL($organizationStore.activities[0].id));
		}
	}

	async function navigate(_event: MouseEvent | undefined, route: PageRoutePaths): Promise<void> {
		_event?.stopPropagation();
		await goto(route);
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
		{:else}
			{@render noCollectiveCards()}
		{/if}
	{/if}
</Layout>

{#snippet accountCard(user: UserModel)}
	<Card color="transparent" classList="text-center" clicked={() => goto(PageRoute.ACCOUNT.ROOT)}>
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
	<Card
		color="transparent"
		classList="border border-[var(--ion-color-secondary)]"
		title="Upcoming event"
		clicked={onNavigateEvent}
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

{#snippet organizationCard(organization: OrganizationModel)}
	<Card
		color="transparent"
		title={organization.name}
		clicked={() => goto(PageRoute.ORGANIZATION.ROOT)}
		classList="border border-[var(--ion-color-primary)]"
	>
		<div class="flex flex-wrap items-center justify-center">
			<Button
				size="small"
				fill="clear"
				color="dark"
				icon={peopleOutline}
				label={`${organization.personsOfOrganization.length} members`}
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.MEMBERS)}
			/>
			<Button
				icon={cashOutline}
				label={formatter.currency(accountPostingsStore.getTotalBudget())}
				size="small"
				fill="clear"
				color="dark"
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.ROOT)}
			/>
			<Button
				icon={flashOutline}
				label={`${$organizationStore?.activities.length ?? 0} activities`}
				size="small"
				fill="clear"
				color="dark"
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
			/>
		</div>
	</Card>
{/snippet}

{#snippet noCollectiveCards()}
	<Card title={$t('routes.home.card.register-organization.title')} classList="text-center">
		<Button
			clicked={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.register')}
		/>
	</Card>
	<Card title={$t('routes.home.card.join-organization.title')} classList="text-center">
		<Button
			clicked={() => goto(PageRoute.ORGANIZATION.JOIN)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.join')}
		/>
	</Card>
{/snippet}
