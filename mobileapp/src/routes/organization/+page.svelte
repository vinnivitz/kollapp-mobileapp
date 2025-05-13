<script lang="ts">
	import type { OrganizationModel } from '$lib/models/models';

	import { actionSheetController } from 'ionic-svelte';
	import {
		buildOutline,
		calendarOutline,
		createOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline,
		swapHorizontalOutline
	} from 'ionicons/icons';
	import { derived as svelteDerived } from 'svelte/store';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { UserRole } from '$lib/models/api';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';
	import { hasRole, showAlert } from '$lib/utility';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);
	const organizations = svelteDerived([organizationStore.organizations], ([$organizations]) => $organizations);

	async function onOrganizationSelect(): Promise<void> {
		if ($organizations.length <= 1) {
			return;
		}

		const actionSheet = await actionSheetController.create({
			buttons: $organizations.map((organization) => ({
				handler: () => {
					organizationStore.change(organization.id);
				},
				role: organizationModel?.id === organization.id ? 'selected' : undefined,
				text: organization.name
			})),
			header: $t('routes.organization.change-organization.action-sheet.title')
		});

		await actionSheet.present();
	}
</script>

<Layout title={$t('routes.organization.title')} showBackButton>
	{#if organizationModel}
		{@render changeCollective(organizationModel)}
		{@render collectiveList()}
	{/if}
	{@render generalList()}
</Layout>

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
				<Button icon={swapHorizontalOutline} click={() => {}}></Button>
			{/if}
		</div>
	</Card>
{/snippet}

{#snippet collectiveList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.organization.list.current-collective.title')}</ion-list-header>
		<LabeledItem
			label={$t('routes.organization.list.organization.activity.label')}
			icon={calendarOutline}
			searchable={PageRoute.ORGANIZATION.ACTIVITY.ROOT}
			click={() => goto(PageRoute.ORGANIZATION.ACTIVITY.ROOT)}
		></LabeledItem>
		{#if hasRole(UserRole.ORGANIZATION_MANAGER)}
			<LabeledItem
				searchable={PageRoute.ORGANIZATION.UPDATE_DATA}
				accessible={[UserRole.ORGANIZATION_MANAGER]}
				click={() => goto(PageRoute.ORGANIZATION.UPDATE_DATA)}
				icon={buildOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
			<LabeledItem
				click={() => showAlert('Feature not implemented yet')}
				icon={peopleOutline}
				label={$t('routes.organization.list.organization.members')}
			/>
			<LabeledItem
				searchable={PageRoute.ORGANIZATION.LEAVE}
				accessible={[UserRole.ORGANIZATION_MANAGER]}
				color="danger"
				click={() => goto(PageRoute.ORGANIZATION.LEAVE)}
				icon={logOutOutline}
				label={$t('routes.organization.list.organization.leave.label')}
			/>
		{/if}
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
