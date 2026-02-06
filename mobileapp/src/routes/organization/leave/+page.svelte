<script lang="ts">
	import { ribbonOutline, trashOutline, warningOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import { Button, Card } from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { t } from '$lib/locales';
	import { organizationStore, userStore } from '$lib/stores';
	import { confirmationModal, hasOrganizationRole, withLoader } from '$lib/utility';

	const currentPersonOfOrganizationId = $derived(
		$organizationStore?.personsOfOrganization.find((person) => person.userId === $userStore?.id)?.id ?? 0
	);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const isLastManager = $derived(
		isManager &&
			$organizationStore?.personsOfOrganization.filter(
				(personOfOrganization) => personOfOrganization.organizationRole === 'ROLE_ORGANIZATION_MANAGER'
			).length === 1
	);

	const hasAssignedPostings = $derived(
		($organizationStore?.activities.some((activity) =>
			activity.activityPostings.some((posting) => posting.personOfOrganizationId === currentPersonOfOrganizationId)
		) ||
			$organizationStore?.organizationPostings.some(
				(posting) => posting.personOfOrganizationId === currentPersonOfOrganizationId
			)) ??
			false
	);

	const assignedPostings = $derived([
		...($organizationStore?.activities.flatMap((activity) =>
			activity.activityPostings.filter((posting) => posting.personOfOrganizationId === currentPersonOfOrganizationId)
		) ?? []),
		...($organizationStore?.organizationPostings.filter(
			(posting) => posting.personOfOrganizationId === currentPersonOfOrganizationId
		) ?? [])
	]);

	async function onLeaveOrganizationPrompt(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.leave.page.modal.confirm'),
			handler: leaveOrganization
		});
	}

	async function leaveOrganization(): Promise<void> {
		await withLoader(() => organizationService.leave());
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
				disabled={hasAssignedPostings}
			/>
			<ion-note>{$t('routes.organization.leave.page.card.note')}</ion-note>
		</div>
		{#if isLastManager}
			{@render lastManagerCard()}
		{/if}
		{#if hasAssignedPostings}
			{@render assignedPostingsCard()}
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
		<Button
			icon={ribbonOutline}
			classList="mt-3"
			fill="default"
			label={$t('routes.organization.leave.page.card.button.members')}
			clicked={async () => goto(resolve('/organization/members'))}
		/>
	</Card>
{/snippet}

{#snippet assignedPostingsCard()}
	<Card color="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-text>{$t('routes.organization.leave.page.card.assigned-postings-warning')}</ion-text>
		</div>
		<ul class="mt-3 list-disc pl-5">
			{#each assignedPostings as posting (posting.id)}
				<li class="font-bold">{posting.purpose}</li>
			{/each}
		</ul>
	</Card>
{/snippet}
