<script lang="ts">
	import { alertController } from '@ionic/core';
	import { trashOutline, warningOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { authenticationService, organizationService, userService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';
	import { StatusCheck } from '$lib/utility';

	const organizations = $derived(organizationStore.organizations);

	const lastManagerOrganizations = $derived(
		$organizations.filter(async (baseOrganization) => {
			const organizationResult = await organizationService.getById(baseOrganization.id);
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
		const alert = await alertController.create({
			buttons: [
				{ role: 'cancel', text: $t('routes.account.delete.page.modal.cancel') },
				{
					handler: () => deleteAccount(),
					text: $t('routes.account.delete.page.modal.confirm')
				}
			],
			header: $t('routes.account.delete.page.modal.header'),
			message: $t('routes.account.delete.page.modal.message')
		});
		await alert.present();
	}

	async function deleteAccount(): Promise<void> {
		const response = await userService.remove();
		if (StatusCheck.isOK(response.status)) {
			await authenticationService.logout();
			goto(resolve('/auth/login'));
		}
	}
</script>

<Layout title={$t('routes.account.delete.page.title')} showBackButton>
	{@render deleteAccountCard()}
</Layout>

<!-- Snippet -->

{#snippet deleteAccountCard()}
	<Card title={$t('routes.account.delete.page.card.title')}>
		<Button
			classList="mt-3"
			expand="block"
			color="danger"
			clicked={onDeleteAccount}
			icon={trashOutline}
			label={$t('routes.account.delete.page.card.submit')}
		/>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.page.card.note')}</ion-note>
		</div>
		{#if lastManagerOrganizations.length > 0}
			{@render lasManagerCard()}
		{/if}
	</Card>
{/snippet}

{#snippet lasManagerCard()}
	<Card color="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<div class="flex flex-col">
				<ion-text>{$t('routes.account.delete.page.card.manager-hint.heading')}</ion-text>
				<ul class="text-start">
					{#each lastManagerOrganizations as organization (organization.id)}
						<li class="font-bold">{organization.name}</li>
					{/each}
				</ul>
				<ion-text>{$t('routes.account.delete.page.card.manager-hint.message')}</ion-text>
			</div>
		</div>
	</Card>
{/snippet}
