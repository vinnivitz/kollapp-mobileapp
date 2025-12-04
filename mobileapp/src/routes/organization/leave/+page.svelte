<script lang="ts">
	import { loadingController } from '@ionic/core';
	import { ribbonOutline, trashOutline, warningOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';
	import { confirmationModal } from '$lib/utility';

	const isLastManager = $derived(
		$organizationStore?.personsOfOrganization.filter(
			(member) => member.organizationRole === 'ROLE_ORGANIZATION_MANAGER'
		).length === 1
	);

	const isLastMember = $derived($organizationStore?.personsOfOrganization.length === 1);

	async function onLeaveOrganizationPrompt(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.leave.page.modal.confirm'),
			handler: leaveOrganization
		});
	}

	async function leaveOrganization(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			await organizationService.leave(organizationId);
			await organizationStore.init();
		}
		await loader.dismiss();
		await goto(resolve('/organization'));
	}
</script>

<Layout title={$t('routes.organization.leave.page.title')} showBackButton>
	{@render leaveOrganizationCard()}
</Layout>

<!-- Snippets -->

{#snippet leaveOrganizationCard()}
	<Card title={$t('routes.organization.leave.page.card.title')}>
		<div class="text-center">
			<Button
				classList="mt-3"
				color="danger"
				expand="block"
				label={$t('routes.organization.leave.page.card.button.leave')}
				icon={trashOutline}
				clicked={onLeaveOrganizationPrompt}
			/>
			<ion-text>{$t('routes.organization.leave.page.card.note')}</ion-text>
		</div>
		{#if isLastManager}
			{@render lastManagerCard()}
			{#if !isLastMember}
				<Button
					icon={ribbonOutline}
					classList="mx-3"
					fill="outline"
					label={$t('routes.organization.leave.page.card.button.members')}
					clicked={() => void goto(resolve('/organization/members'))}
				/>
			{/if}
		{/if}
	</Card>
{/snippet}

{#snippet lastManagerCard()}
	<Card color="warning" classList="font-bold">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-text>{$t('routes.organization.leave.page.card.warning')}</ion-text>
		</div>
	</Card>
{/snippet}
