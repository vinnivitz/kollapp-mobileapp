<script lang="ts">
	import type { DeleteAccountRequestTO, OrganizationTO } from '@kollapp/api-types';

	import { keyOutline, trashOutline, warningOutline } from 'ionicons/icons';

	import { deleteAccountSchema } from '$lib/api/schema/user';
	import { authenticationService, organizationService, userService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import { Form, type FormActions } from '$lib/models/ui';
	import { organizationStore, userStore } from '$lib/stores';
	import { confirmationModal, customForm, StatusCheck } from '$lib/utility';

	type AssignedPosting = { id: number; purpose: string };
	type OrganizationPostings = { organizationName: string; postings: AssignedPosting[] };
	type OrganizationCheckResult = {
		assignedPostings: AssignedPosting[];
		isLastManager: boolean;
		organization: OrganizationTO;
	};

	const organizations = $derived(organizationStore.organizations);
	const userId = $derived($userStore?.id);
	let showPasswordPrompt = $state<boolean>(false);
	let actions: FormActions<DeleteAccountRequestTO>;
	let organizationChecks = $state<OrganizationCheckResult[]>([]);

	const form = new Form({
		completed: async () => afterAccountDeletion(),
		exposedActions: (exposedActions) => (actions = exposedActions),
		request: async (model: DeleteAccountRequestTO) => userService.remove(model),
		schema: deleteAccountSchema()
	});

	$effect(() => {
		loadOrganizationChecks();
	});

	async function loadOrganizationChecks(): Promise<void> {
		const results: OrganizationCheckResult[] = [];

		for (const baseOrganization of $organizations) {
			const organizationResult = await organizationService.getById(baseOrganization.id);
			if (!StatusCheck.isOK(organizationResult.status)) {
				continue;
			}

			const organization = organizationResult.data;
			const managers = organization.personsOfOrganization.filter(
				(person) => person.organizationRole === 'ROLE_ORGANIZATION_MANAGER'
			);
			const isLastManager = managers.length === 1;
			const postings = getAssignedPostingsInOrganization(organization);

			results.push({
				assignedPostings: postings,
				isLastManager,
				organization
			});
		}

		organizationChecks = results;
	}

	const lastManagerOrganizations = $derived(
		organizationChecks.filter((check) => check.isLastManager).map((check) => check.organization)
	);

	const postingsByOrganization = $derived<OrganizationPostings[]>(
		organizationChecks
			.filter((check) => check.assignedPostings.length > 0)
			.map((check) => ({
				organizationName: check.organization.name,
				postings: check.assignedPostings
			}))
	);

	const hasAssignedPostings = $derived(postingsByOrganization.length > 0);

	function getCurrentPersonOfOrganizationId(organization: OrganizationTO): number {
		return organization.personsOfOrganization.find((person) => person.userId === userId)?.id ?? 0;
	}

	function getAssignedPostingsInOrganization(organization: OrganizationTO): AssignedPosting[] {
		const currentPersonId = getCurrentPersonOfOrganizationId(organization);
		const activityPostings: AssignedPosting[] = organization.activities.flatMap((activity) =>
			activity.activityPostings
				.filter((posting) => posting.personOfOrganizationId === currentPersonId)
				.map((posting) => ({ id: posting.id, purpose: posting.purpose }) satisfies AssignedPosting)
		);
		const organizationPostings: AssignedPosting[] = organization.organizationPostings
			.filter((posting) => posting.personOfOrganizationId === currentPersonId)
			.map((posting) => ({ id: posting.id, purpose: posting.purpose }) satisfies AssignedPosting);
		return [...activityPostings, ...organizationPostings];
	}

	async function onShowDeletionWarning(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.account.delete.page.modal.confirm'),
			handler: onDeleteAccount,
			header: $t('routes.account.delete.page.modal.header')
		});
	}

	async function onDeleteAccount(): Promise<void> {
		showPasswordPrompt = true;
	}

	async function onPasswordPromptDismiss(): Promise<void> {
		actions.setModel();
		showPasswordPrompt = false;
	}

	async function afterAccountDeletion(): Promise<void> {
		showPasswordPrompt = false;
		await authenticationService.logout();
	}
</script>

<Layout title={$t('routes.account.delete.page.title')} showBackButton>
	{@render deleteAccountCard()}
</Layout>

<!-- Snippet -->

{#snippet deleteAccountCard()}
	<Card title={$t('routes.account.delete.page.card.title')}>
		{#if lastManagerOrganizations.length > 0}
			{@render lasManagerCard()}
		{/if}
		{#if hasAssignedPostings}
			{@render assignedPostingsCard()}
		{/if}
		<Button
			classList="mt-3"
			expand="block"
			color="danger"
			clicked={onShowDeletionWarning}
			icon={trashOutline}
			label={$t('routes.account.delete.page.card.submit')}
			disabled={hasAssignedPostings}
		/>
		<div class="text-center">
			<ion-note>{$t('routes.account.delete.page.card.note')}</ion-note>
		</div>
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

{#snippet assignedPostingsCard()}
	<Card color="warning">
		<div class="flex items-center justify-center gap-2">
			<ion-avatar class="flex items-center justify-center">
				<ion-icon icon={warningOutline} size="large"></ion-icon>
			</ion-avatar>
			<ion-text>{$t('routes.account.delete.page.card.assigned-postings-warning')}</ion-text>
		</div>
		<ul class="mt-3 list-disc pl-5">
			{#each postingsByOrganization as orgPostings (orgPostings.organizationName)}
				<li class="font-bold">{orgPostings.organizationName}</li>
				<ul class="list-disc pl-5">
					{#each orgPostings.postings as posting (posting.id)}
						<li>{posting.purpose}</li>
					{/each}
				</ul>
			{/each}
		</ul>
	</Card>
{/snippet}

<!-- Modals -->

<!-- Password Confirmation Modal -->
<Popover extended open={showPasswordPrompt} dismissed={onPasswordPromptDismiss}>
	<Card title={$t('routes.account.privacy-and-security.page.modal.password.card.title')}>
		<form use:customForm={form}>
			<InputItem
				name="password"
				type="password"
				label={$t('routes.account.privacy-and-security.page.modal.password.card.form.password')}
				icon={keyOutline}
			/>
			<Button
				classList="mt-3"
				expand="block"
				type="submit"
				label={$t('routes.account.delete.page.modal.password.card.form.submit')}
				icon={keyOutline}
			/>
		</form>
	</Card>
</Popover>
