<script lang="ts">
	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import {
		buildOutline,
		calendarClearOutline,
		cardOutline,
		createOutline,
		flashOutline,
		locationOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		ribbonOutline,
		swapHorizontalOutline,
		warningOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import { Button, Card, IconLabel, LabeledItem } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { BudgetOverview } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { organizationStore, userStore } from '$lib/stores';
	import { getRoleTranslationFromRole, hasOrganizationRole, triggerClickByLabel } from '$lib/utility';

	const organizations = $derived(organizationStore.organizations);
	const postings = $derived(
		[
			...($organizationStore?.organizationPostings ?? []),
			...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
		].toSorted((a, b) => new TZDate(b.date).getTime() - new TZDate(a.date).getTime())
	);
	const organizationRole = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.organizationRole
	);
	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	let descriptionExpanded = $state<boolean>(false);
	const pendingMembersCount = $derived(
		$organizationStore?.personsOfOrganization.filter(
			(personOfOrganization) => personOfOrganization.status === 'PENDING'
		).length ?? 0
	);

	let organizationDescriptionNote = $state<HTMLIonNoteElement>();

	const organizationDescriptionNoteTruncated = $derived(
		organizationDescriptionNote && organizationDescriptionNote?.scrollWidth > organizationDescriptionNote?.clientWidth
	);

	async function onOrganizationSelect(): Promise<void> {
		const actionSheet = await actionSheetController.create({
			buttons: $organizations.map((organization) => ({
				handler: async () => {
					if ($organizationStore?.id === organization.id) return;
					await organizationStore.update(organization.id);
				},
				role: $organizationStore?.id === organization.id ? 'selected' : undefined,
				text: organization.name
			})),
			header: $t('routes.organization.page.modal.select-organization.header')
		});
		await actionSheet.present();
	}
</script>

<Layout title={$t('routes.organization.page.title')}>
	{#if $organizationStore}
		{@render collectiveName()}
		{@render collectiveInfo()}
		{@render budgetCard()}
		{@render activityList()}
		{@render collectiveList()}
	{:else if $organizations.length === 0}
		{@render noCollectiveCard()}
	{/if}
	{@render miscellaneousList()}
</Layout>

<!-- Snippets -->

{#snippet noCollectiveCard()}
	<Card border="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon color="warning" icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-note>{$t('routes.organization.page.no-collective.note')}</ion-note>
		</div>
	</Card>
{/snippet}

{#snippet activityList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.page.activity-list.list.header')}</ion-list-header>
		{#if isManager}
			<LabeledItem
				label={$t('routes.organization.page.activity-list.list.create-activity')}
				icon={flashOutline}
				clicked={async () => {
					await goto(resolve('/organization/activities'));
					await triggerClickByLabel($t('routes.organization.page.activity-list.list.create-activity'));
				}}
			/>
		{/if}
		<LabeledItem
			label={$t('routes.organization.page.activity-list.list.manage-activities')}
			icon={calendarClearOutline}
			indexed="/organization/activities"
			clicked={() => goto(resolve('/organization/activities'))}
		/>
	</ion-list>
{/snippet}

{#snippet collectiveName()}
	<div class="flex items-center justify-center gap-4 text-2xl">
		<ion-text class="font-bold">{$organizationStore?.name}</ion-text>
		{#if $organizations.length > 1}
			<Button fill="outline" clicked={onOrganizationSelect} icon={swapHorizontalOutline} />
		{/if}
	</div>
{/snippet}

{#snippet collectiveInfo()}
	<Card
		border="primary"
		tourId={TourStepId.ORGANIZATION.INFO}
		classList="text-center cursor-pointer"
		clicked={organizationDescriptionNoteTruncated ? () => (descriptionExpanded = !descriptionExpanded) : undefined}
	>
		<div class="flex flex-col items-center justify-center gap-3">
			<ion-text
				bind:this={organizationDescriptionNote}
				class:max-h-screen={descriptionExpanded}
				class:whitespace-pre-line={descriptionExpanded}
				class="max-h-6 overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-500 ease-in-out"
			>
				{$organizationStore?.description}
			</ion-text>
			<IconLabel icon={locationOutline} label={$organizationStore?.place!} />
			<IconLabel
				icon={ribbonOutline}
				label={$t('routes.organization.page.collective-info.role', {
					value: getRoleTranslationFromRole(organizationRole!)
				})}
			/>
		</div>
	</Card>
{/snippet}

{#snippet collectiveList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.page.collective-list.list.header')}</ion-list-header>
		<LabeledItem
			badge={pendingMembersCount > 0 ? `${pendingMembersCount}` : undefined}
			indexed="/organization/members"
			tourId={TourStepId.ORGANIZATION.MEMBERS_LINK}
			clicked={() => goto(resolve('/organization/members'))}
			icon={peopleOutline}
			label={$t('routes.organization.page.collective-list.list.members')}
		/>
		{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
			<LabeledItem
				indexed="/organization/update-data"
				accessible="ROLE_ORGANIZATION_MANAGER"
				clicked={() => goto(resolve('/organization/update-data'))}
				icon={buildOutline}
				label={$t('routes.organization.page.collective-list.list.update-info')}
			/>
			<LabeledItem
				indexed="/organization/budget-categories"
				tourId={TourStepId.ORGANIZATION.BUDGET_CATEGORIES_LINK}
				accessible="ROLE_ORGANIZATION_MANAGER"
				clicked={() => goto(resolve('/organization/budget-categories'))}
				icon={cardOutline}
				label={$t('routes.organization.page.collective-list.list.budget-categories')}
			/>
		{/if}
		{#if $organizations.length > 1}
			<LabeledItem
				indexed="/organization"
				clicked={onOrganizationSelect}
				icon={swapHorizontalOutline}
				label={$t('routes.organization.page.collective-list.list.change-collective')}
			/>
		{/if}
		<LabeledItem
			indexed="/organization/leave"
			clicked={() => goto(resolve('/organization/leave'))}
			icon={logOutOutline}
			label={$t('routes.organization.page.collective-list.list.leave')}
		/>
	</ion-list>
{/snippet}

{#snippet miscellaneousList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.page.general.list.header')}</ion-list-header>

		<LabeledItem
			indexed="/organization/register"
			clicked={() => goto(resolve('/organization/register'))}
			icon={createOutline}
			label={$t('routes.organization.page.general.list.register')}
		/>
		<LabeledItem
			indexed="/organization/join"
			clicked={() => goto(resolve('/organization/join'))}
			icon={personAddOutline}
			label={$t('routes.organization.page.general.list.join')}
		/>
	</ion-list>
{/snippet}

{#snippet budgetCard()}
	<BudgetOverview
		activities={$organizationStore?.activities!}
		budgetCategories={$organizationStore?.budgetCategories!}
		index="/organization"
		personsOfOrganization={$organizationStore?.personsOfOrganization!}
		{postings}
		title={$t('routes.organization.page.budget-card.card.title')}
		tourId={TourStepId.ORGANIZATION.BUDGET}
		onCreateOrganizationPosting={budgetService.createOrganizationPosting}
		onCreateActivityPosting={budgetService.createActivityPosting}
		onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
		onUpdateActivityPosting={budgetService.updateActivityPosting}
		onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
		onDeleteActivityPosting={budgetService.deleteActivityPosting}
		onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
		onTransferActivityPosting={budgetService.transferActivityPosting}
		onOpenStatistics={async () => goto(resolve('/organization/budget-statistics'))}
	/>
{/snippet}
