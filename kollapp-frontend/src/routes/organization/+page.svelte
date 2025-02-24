<script lang="ts">
	import { arrowForward } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { OrganizationModel } from '$lib/models/store';
	import { organizationStore } from '$lib/store';
	import { clickableElement } from '$lib/utils';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);

	const loading = $derived<boolean>(!organizationModel);
</script>

<Layout title={$t('routes.organization.title')} {loading}>
	{#if organizationModel}
		<ion-list-header>Update information</ion-list-header>
		<ion-list inset>
			<ion-item use:clickableElement={() => goto(PageRoute.ORGANIZATION.UPDATE_INFO)}>
				<ion-label>Update collective info</ion-label>
				<ion-icon icon={arrowForward} slot="end"></ion-icon>
			</ion-item>
		</ion-list>
	{/if}
</Layout>
