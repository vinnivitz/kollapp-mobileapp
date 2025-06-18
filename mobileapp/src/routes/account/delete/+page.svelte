<script lang="ts">
	import { trashOutline } from 'ionicons/icons';

	import { authResource, userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { StatusCheck } from '$lib/utility';
	import { goto } from '$app/navigation';
	import { PageRoute } from '$lib/models/routing';

	async function onDeleteAccount(): Promise<void> {
		const response = await userResource.deleteAccount();
		if (StatusCheck.isOK(response.status)) {
			await authResource.logout();
			goto(PageRoute.AUTH.LOGIN);
		}
	}
</script>

<Layout title={$t('routes.account.delete.title')} showBackButton>
	<Card title={$t('routes.account.delete.card.title')}>
		<Button
			classList="mt-3"
			expand="block"
			color="danger"
			click={onDeleteAccount}
			icon={trashOutline}
			label={$t('routes.account.delete.card.button')}
		/>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.card.note')}</ion-note>
		</div>
	</Card>
</Layout>
