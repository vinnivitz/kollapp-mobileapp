<script lang="ts">
	import { trashOutline } from 'ionicons/icons';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';

	async function leaveOrganization(): Promise<void> {
		await organizationResource.leaveOrganization();
	}
</script>

<Layout title={$t('routes.account.delete.title')} showBackButton>
	<Card title={$t('routes.account.delete.card.title')}>
		<Button
			classList="mt-3"
			expand="block"
			color="danger"
			click={leaveOrganization}
			icon={trashOutline}
			label={$t('routes.account.delete.card.button')}
		/>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.card.note')}</ion-note>
		</div>
	</Card>
</Layout>
