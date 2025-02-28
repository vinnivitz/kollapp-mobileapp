<script lang="ts">
	import { trashOutline } from 'ionicons/icons';

	import { apiResources } from '$lib/api';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';

	async function deleteOrganization() {
		await apiResources.organization.deleteOrganization();
	}
</script>

<IonLayout title={$t('routes.account.delete.title')} showBackButton>
	<Card title={$t('routes.account.delete.card.title')}>
		<Button classProp="mt-3" expand="block" type="submit" color="danger" click={deleteOrganization}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={trashOutline} size="large"></ion-icon>
				<ion-text color="light">
					{$t('routes.account.delete.card.button')}
				</ion-text>
			</div>
		</Button>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.card.note')}</ion-note>
		</div>
	</Card>
</IonLayout>
