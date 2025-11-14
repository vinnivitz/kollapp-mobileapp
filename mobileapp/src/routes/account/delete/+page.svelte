<script lang="ts">
	import { trashOutline, warningOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { authenticationResource, organizationResource, userResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';
	import { StatusCheck } from '$lib/utility';

	const organizations = $derived(organizationStore.organizations);

	const lastManagerOrganizations = $derived(
		$organizations.filter(async (baseOrganization) => {
			const organizationResult = await organizationResource.getById(baseOrganization.id);
			if (!StatusCheck.isOK(organizationResult.status)) {
				return false;
			}
			const organization = organizationResult.data;
			const managers = organization.personsOfOrganization.filter(
				(member) => member.organizationRole === 'ROLE_ORGANIZATION_MANAGER'
			);
			return managers.length === 1;
		})
	);

	async function onDeleteAccount(): Promise<void> {
		const response = await userResource.remove();
		if (StatusCheck.isOK(response.status)) {
			await authenticationResource.logout();
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
			clicked={onDeleteAccount}
			icon={trashOutline}
			label={$t('routes.account.delete.card.button')}
		/>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.card.note')}</ion-note>
		</div>
		{#if lastManagerOrganizations.length > 0}
			<Card color="warning">
				<div class="flex items-center justify-center gap-2">
					<ion-avatar class="flex items-center justify-center">
						<ion-icon icon={warningOutline} size="large"></ion-icon>
					</ion-avatar>
					<div class="flex flex-col">
						<ion-text>You are the last manager of the following organizations:</ion-text>
						<ul class="text-start">
							{#each lastManagerOrganizations as organization (organization.id)}
								<li class="font-bold">{organization.name}</li>
							{/each}
						</ul>
						<ion-text>Deleting the account will delete these organizations.</ion-text>
					</div>
				</div>
			</Card>
		{/if}
	</Card>
</Layout>
