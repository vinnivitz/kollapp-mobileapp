<script lang="ts">
	import {
		buildOutline,
		calendarOutline,
		createOutline,
		logOutOutline,
		peopleOutline,
		personAddOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { UserRole } from '$lib/models/api';
	import type { OrganizationModel } from '$lib/models/models';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';
	import { hasRole, showAlert } from '$lib/utils';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);
</script>

<Layout title={$t('routes.organization.title')} showBackButton>
	{#if organizationModel}
		<ion-list inset>
			<ion-list-header
				>{$t('routes.organization.list.current-collective.title', {
					value: organizationModel.name
				})}</ion-list-header
			>
			<LabeledItem
				label={$t('routes.organization.list.organization.activity.label')}
				icon={calendarOutline}
				click={() => goto(PageRoute.ORGANIZATION.ACTIVITY.ROOT)}
			></LabeledItem>
			{#if hasRole(UserRole.MANAGER)}
				<LabeledItem
					searchable={PageRoute.ORGANIZATION.UPDATE_DATA}
					accessible={[UserRole.MANAGER]}
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
					accessible={[UserRole.MANAGER]}
					color="danger"
					click={() => goto(PageRoute.ORGANIZATION.LEAVE)}
					icon={logOutOutline}
					label={$t('routes.organization.list.organization.leave.label')}
				/>
			{/if}
		</ion-list>
	{/if}
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
</Layout>
