<script lang="ts">
	import type { ActivityModel, OrganizationModel } from '$lib/models/models';

	import { addDays, formatDistanceToNow } from 'date-fns';
	import { actionSheetController } from 'ionic-svelte';
	import {
		buildOutline,
		calendarOutline,
		createOutline,
		flashOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		swapHorizontalOutline
	} from 'ionicons/icons';
	import { derived as svelteDerived } from 'svelte/store';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { UserRole } from '$lib/models/api';
	import { PageRoute } from '$lib/models/routing';
	import { localeStore, organizationStore } from '$lib/stores';
	import { getDateFnsLocale, hasRole } from '$lib/utility';

	const organizations = svelteDerived(organizationStore.organizations, ($organizations) => $organizations);

	async function onOrganizationSelect(): Promise<void> {
		if ($organizations.length <= 1) return;

		const actionSheet = await actionSheetController.create({
			buttons: $organizations.map((organization) => ({
				handler: () => organizationStore.update(organization.id),
				role: $organizationStore?.id === organization.id ? 'selected' : undefined,
				text: organization.name
			})),
			header: $t('routes.organization.change-organization.action-sheet.title')
		});

		await actionSheet.present();
	}
</script>

<Layout title={$t('routes.organization.title')} showBackButton>
	{#if $organizationStore}
		{#if $organizationStore.activities.length > 0}
			{@render changeCollective($organizationStore)}
		{/if}

		{@render upcomingEvent($organizationStore.activities)}
		{@render eventsList()}
		{@render collectiveList()}
	{/if}
	{@render generalList()}
</Layout>

{#snippet upcomingEvent(activities: ActivityModel[])}
	<Card
		title="Upcoming event"
		classList="mt-5"
		click={() => activities[0]?.id && goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL(activities[0].id))}
	>
		<div class="flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activities[0]?.name}</ion-text>
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

{#snippet eventsList()}
	<ion-list inset class="mt-0 pt-0">
		<ion-list-header>Events</ion-list-header>
		<LabeledItem
			label={$t('routes.organization.list.organization.activity.label')}
			icon={calendarOutline}
			searchable={PageRoute.ORGANIZATION.ACTIVITIES.ROOT}
			click={() => goto(PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
		></LabeledItem>
	</ion-list>
{/snippet}

{#snippet changeCollective(model: OrganizationModel)}
	<Card
		id={$t('routes.organization.change-organization.action-sheet.title')}
		icon={swapHorizontalOutline}
		click={onOrganizationSelect}
		searchable={PageRoute.ORGANIZATION.ROOT}
	>
		<div class="flex items-center justify-center gap-4 text-2xl">
			<ion-text color="dark">{model.name}</ion-text>
			{#if $organizations.length > 1}
				<ion-icon color="secondary" icon={swapHorizontalOutline}></ion-icon>
			{/if}
		</div>
	</Card>
{/snippet}

{#snippet collectiveList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.current-collective.title')}</ion-list-header>
		<LabeledItem
			searchable={PageRoute.ORGANIZATION.MEMBERS}
			click={() => goto(PageRoute.ORGANIZATION.MEMBERS)}
			icon={peopleOutline}
			label={$t('routes.organization.list.organization.members')}
		/>
		{#if !hasRole(UserRole.MANAGER)}
			<LabeledItem
				searchable={PageRoute.ORGANIZATION.UPDATE_DATA}
				accessible={[UserRole.MANAGER]}
				click={() => goto(PageRoute.ORGANIZATION.UPDATE_DATA)}
				icon={buildOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
		{/if}
		<LabeledItem
			searchable={PageRoute.ORGANIZATION.LEAVE}
			click={() => goto(PageRoute.ORGANIZATION.LEAVE)}
			icon={logOutOutline}
			label={$t('routes.organization.list.organization.leave.label')}
		/>
	</ion-list>
{/snippet}

{#snippet generalList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.general.title')}</ion-list-header>

		<LabeledItem
			searchable={PageRoute.ORGANIZATION.REGISTER}
			click={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			icon={createOutline}
			label={$t('routes.organization.list.general.register.label')}
		/>
		<LabeledItem
			searchable={PageRoute.ORGANIZATION.JOIN}
			click={() => goto(PageRoute.ORGANIZATION.JOIN)}
			icon={personAddOutline}
			label={$t('routes.organization.list.general.join.label')}
		/>
	</ion-list>
{/snippet}
