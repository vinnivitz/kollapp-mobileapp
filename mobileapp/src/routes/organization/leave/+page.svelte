<script lang="ts">
	import { alertController, loadingController } from '@ionic/core';
	import { ribbonOutline, trashOutline, warningOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore } from '$lib/stores';

	const isLastManager = $derived(
		$organizationStore?.personsOfOrganization.filter(
			(member) => member.organizationRole === 'ROLE_ORGANIZATION_MANAGER'
		).length === 1
	);

	const isLastMember = $derived($organizationStore?.personsOfOrganization.length === 1);

	async function onLeaveOrganization(): Promise<void> {
		const alert = await alertController.create({
			buttons: [
				{ role: 'cancel', text: 'Cancel' },
				{ handler: async () => await leaveOrganization(), text: 'Leave' }
			],
			header: `Are you sure?`,
			message: `This action cannot be undone.`
		});
		await alert.present();
	}

	async function leaveOrganization(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			await organizationResource.leave(organizationId);
			await organizationStore.init();
		}
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
				clicked={onLeaveOrganization}
			/>
			<ion-text>{$t('routes.organization.page.leave.card.note')}</ion-text>
		</div>
		{#if isLastManager}
			<Card color="warning" classList="font-bold">
				<div class="flex items-center justify-center gap-2">
					<ion-avatar class="flex items-center justify-center">
						<ion-icon icon={warningOutline} size="large"></ion-icon>
					</ion-avatar>
					<ion-text>You are the last manager of this organization. Leaving will delete the organization. </ion-text>
				</div>
			</Card>
			{#if !isLastMember}
				<Button
					icon={ribbonOutline}
					classList="mx-3"
					fill="outline"
					label="Grant manager role to another member"
					clicked={() => goto(PageRoute.ORGANIZATION.MEMBERS)}
				/>
			{/if}
		{/if}
	</Card>
</Layout>
