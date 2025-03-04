<script lang="ts">
	import { accessibilityOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { OrganizationModel } from '$lib/models/store';
	import { organizationStore } from '$lib/store';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);

	const loading = $derived<boolean>(!organizationModel);
</script>

<Layout title={$t('routes.organization.title')} {loading} showBackButton>
	{#if organizationModel}
		<ion-list inset>
			<ion-list-header>{$t('routes.organization.list.update-info.title')}</ion-list-header>
			<LabeledItem
				searchable={PageRoute.ORGANIZATION.UPDATE_DATA}
				detail
				click={() => goto(PageRoute.ORGANIZATION.UPDATE_DATA)}
				iconSrc={accessibilityOutline}
				label={$t('routes.organization.list.update-info.update-info')}
			/>
		</ion-list>
	{/if}
</Layout>
