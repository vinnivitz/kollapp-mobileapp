<script lang="ts">
	import { addDays, formatDistanceToNow } from 'date-fns';
	import { accessibilityOutline, calendarOutline, cashOutline, flashOutline, peopleOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import PieChart from '$lib/components/widgets/PieChart.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { initializationStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import { getDateFnsLocale } from '$lib/utility';
</script>

<Layout title={$t('routes.home.title')}>
	{#if $initializationStore}
		<Card
			title={$t('routes.home.card.user.title', { value: $userStore?.username })}
			classList="text-center"
			click={() => goto(PageRoute.ACCOUNT.ROOT)}
		>
			<!-- <Button fill="outline" label="Go to account" icon={personOutline} click={() => goto(PageRoute.ACCOUNT.ROOT)} /> -->
		</Card>

		{#if $organizationStore}
			{#if $organizationStore.activities.length > 0}
				<Card title="Upcoming event" click={() => goto(PageRoute.ORGANIZATION.ACTIVITIES)}>
					<div class="mb-3 flex flex-wrap items-center justify-center gap-5">
						<div class="flex items-center gap-2">
							<ion-icon icon={flashOutline}></ion-icon>
							<ion-text>{$organizationStore.activities[0]?.name}</ion-text>
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
					<!-- <div class="text-center">
						<Button
							label="Go to event"
							icon={calendarOutline}
							fill="outline"
							click={() => goto(PageRoute.ORGANIZATION.ACTIVITIES)}
						></Button>
					</div> -->
				</Card>
			{/if}
			<Card title={$organizationStore.name} click={() => goto(PageRoute.ORGANIZATION.ROOT)}>
				<div class="flex flex-wrap items-center justify-center gap-5">
					<div class="flex items-center justify-center gap-2">
						<ion-icon icon={peopleOutline}></ion-icon>
						<ion-text>{$organizationStore.personsOfOrganization.length} members</ion-text>
					</div>
					<div class="flex items-center justify-center gap-2">
						<ion-icon icon={cashOutline}></ion-icon>
						<ion-text>150.34€</ion-text>
					</div>
				</div>
				<div class="mt-3 text-center">
					<PieChart></PieChart>
				</div>
				<!-- <div class="text-center">
					<Button
						click={() => goto(PageRoute.ORGANIZATION.ROOT)}
						fill="outline"
						icon={accessibilityOutline}
						label={$t('routes.home.card.organization.button')}
					/>
				</div> -->
			</Card>
			<Card title="Notifications" classList="text-center">
				<ion-text>{$t('routes.home.card.notifications.no-notes')}</ion-text>
			</Card>
		{:else}
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
		{/if}
	{/if}
</Layout>
