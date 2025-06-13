<script lang="ts">
	import { loadingController } from 'ionic-svelte';
	import { trashOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';
	import { removeStoredValue } from '$lib/utility';

	async function leaveOrganization(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		await Promise.all([
			organizationResource.leaveOrganization(),
			removeStoredValue(PreferencesKey.SELECTED_ORGANIZATION_ID)
		]);
		await organizationStore.init();
		await loader.dismiss();
		goto(PageRoute.ORGANIZATION.ROOT);
	}
</script>

<Layout title={$t('routes.organization.page.leave.title')} showBackButton>
	<Card title={$t('routes.organization.page.leave.card.title')}>
		<div class="text-center">
			<Button
				classList="mt-3"
				color="danger"
				expand="block"
				label={$t('routes.organization.page.leave.card.button')}
				icon={trashOutline}
				click={leaveOrganization}
			/>
			<ion-text>{$t('routes.organization.page.leave.card.note')}</ion-text>
		</div>
	</Card>
</Layout>
