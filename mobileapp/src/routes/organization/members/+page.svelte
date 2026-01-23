<script lang="ts">
	import type { OrganizationRole, PersonOfOrganizationTO } from '@kollapp/api-types';

	import { Clipboard } from '@capacitor/clipboard';
	import { Share } from '@capacitor/share';
	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import QRCode from '@trasherdk/svelte-qrcode';
	import { EmailComposer } from 'capacitor-email-composer';
	import { formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		checkmarkOutline,
		clipboardOutline,
		closeOutline,
		informationCircleOutline,
		logOutOutline,
		mailOutline,
		medalOutline,
		personAddOutline,
		personCircleOutline,
		personOutline,
		qrCode,
		qrCodeOutline,
		refreshCircleOutline,
		ribbonOutline,
		shareOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import environment from '$lib/environment';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/tour';
	import { AlertType, type ItemSlidingOption } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		confirmationModal,
		getDateFnsLocale,
		getRoleTranslationFromRole,
		hasOrganizationRole,
		informationModal,
		showAlert,
		StatusCheck
	} from '$lib/utility';

	let invitationCodeModalOpen = $state<boolean>(false);
	let qrModalOpen = $state<boolean>(false);

	let searchValue = $state<string>('');

	const userId = $derived($userStore?.id);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const invitationCodeExpiration = $derived(
		new TZDate($organizationStore?.organizationInvitationCode.expirationDate ?? '')
	);
	const invitationCode = $derived($organizationStore?.organizationInvitationCode.code ?? '');

	const personsOfOrganization = $derived(
		($organizationStore?.personsOfOrganization ?? [])
			.toSorted((a, b) => a.username.localeCompare(b.username))
			.filter((person) => person.status === 'APPROVED')
	);

	const filteredPersonsOfOrganization = $derived(
		searchValue
			? personsOfOrganization.filter((personOfOrganization) =>
					personOfOrganization.username.toLowerCase().includes(searchValue.toLowerCase())
				)
			: personsOfOrganization
	);

	const pendingPersonsOfOrganization = $derived(
		($organizationStore?.personsOfOrganization ?? []).filter(
			(person) => person.userId !== userId && person.status === 'PENDING'
		)
	);

	const personOfOrganizationGroups = $derived(getGroupedMembers(filteredPersonsOfOrganization));

	const isExpired = $derived(invitationCodeExpiration.getTime() <= Date.now());

	function getPersonOfOrganizationSlidingOptions(personOfOrganization: PersonOfOrganizationTO): ItemSlidingOption[] {
		const options: ItemSlidingOption[] = [
			{
				color: 'primary',
				handler: () => onViewMemberDetails(personOfOrganization),
				icon: informationCircleOutline,
				label: $t('routes.organization.members.page.sliding-options.view-details')
			}
		];
		if (isManager) {
			options.push(
				{
					color: 'tertiary',
					handler: () => onSelectRole(personOfOrganization),
					icon: ribbonOutline,
					label: $t('routes.organization.members.page.sliding-options.select-role')
				},
				{
					color: 'danger',
					handler: () => onRemovePersonOfOrganizationPrompt(personOfOrganization),
					icon: logOutOutline,
					label: $t('routes.organization.members.page.sliding-options.remove-member')
				}
			);
		}
		return options;
	}

	function onViewMemberDetails(personOfOrganization: PersonOfOrganizationTO): void {
		goto(resolve(`/organization/members/${personOfOrganization.id}`));
	}

	function getPendingPersonOfOrganizationSlidingOptions(
		personOfOrganization: PersonOfOrganizationTO
	): ItemSlidingOption[] {
		return [
			{ color: 'success', handler: () => onApproveMemberPrompt(personOfOrganization), icon: checkmarkOutline },
			{ color: 'danger', handler: () => onDenyMembershipRequestPrompt(personOfOrganization), icon: closeOutline }
		];
	}

	async function onApproveMemberPrompt(personOfOrganization: PersonOfOrganizationTO): Promise<void> {
		return confirmationModal({
			confirmText: $t('routes.organization.members.page.modal.approve-member.confirm'),
			handler: async () => await approveUser(personOfOrganization.id),
			header: $t('routes.organization.members.page.modal.approve-member.header'),
			message: $t('routes.organization.members.page.modal.approve-member.message', {
				value: personOfOrganization.username
			})
		});
	}

	async function onRemovePersonOfOrganizationPrompt(personOfOrganization: PersonOfOrganizationTO): Promise<void> {
		const untransferredPostings = getUntransferredPostingsForMember(personOfOrganization.id);

		if (untransferredPostings.length > 0) {
			const message = `${$t('routes.organization.members.page.modal.untransferred-postings.message', { value: personOfOrganization.username })}`;
			return informationModal($t('routes.organization.members.page.modal.untransferred-postings.header'), message);
		}

		return confirmationModal({
			confirmText: $t('routes.organization.members.page.modal.remove-member.confirm'),
			handler: async () => await removePersonOfOrganization(personOfOrganization.id),
			message: $t('routes.organization.members.page.modal.remove-member.message', {
				value: personOfOrganization.username
			})
		});
	}

	function getUntransferredPostingsForMember(
		personOfOrganizationId: number
	): { amountInCents: number; purpose: string }[] {
		const organizationPostings = $organizationStore?.organizationPostings ?? [];
		const activityPostings = $organizationStore?.activities.flatMap((a) => a.activityPostings) ?? [];
		const allPostings = [...organizationPostings, ...activityPostings];

		return allPostings
			.filter((posting) => posting.personOfOrganizationId === personOfOrganizationId)
			.map((posting) => ({ amountInCents: posting.amountInCents, purpose: posting.purpose }));
	}

	async function onDenyMembershipRequestPrompt(personOfOrganization: PersonOfOrganizationTO): Promise<void> {
		return confirmationModal({
			handler: async () => await removePersonOfOrganization(personOfOrganization.id),
			message: $t('routes.organization.members.page.modal.deny-membership-request.message', {
				value: personOfOrganization.username
			})
		});
	}

	async function approveUser(personOfOrganizationId: number): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (!organizationId) return;
		const response = await organizationService.approveUser(organizationId, personOfOrganizationId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update(organizationId);
		}
	}

	async function removePersonOfOrganization(personOfOrganizationId: number): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (!organizationId) return;
		const response = await organizationService.removePersonOfOrganization(organizationId, personOfOrganizationId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update(organizationId);
		}
	}

	async function onSelectRole(personOfOrganization: PersonOfOrganizationTO): Promise<void> {
		const organizationId = $organizationStore?.id as number;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () =>
						onGrantOrganizationRolePrompt(personOfOrganization.id, organizationId, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: personOfOrganization.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () =>
						onGrantOrganizationRolePrompt(personOfOrganization.id, organizationId, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: personOfOrganization.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function onGrantOrganizationRolePrompt(
		personOfOrganizationId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		if (role === personsOfOrganization.find((person) => person.id === personOfOrganizationId)?.organizationRole) {
			return;
		}
		await confirmationModal({
			handler: async () => await grantOrganizationRole(personOfOrganizationId, organizationId, role),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}

	async function grantOrganizationRole(
		personOfOrganizationId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		await organizationService.grantRole(organizationId, personOfOrganizationId, role);
		await organizationStore.update(organizationId);
	}

	function getGroupedMembers(personsOfOrganization: PersonOfOrganizationTO[]): [string, PersonOfOrganizationTO[]][] {
		const result: Map<string, PersonOfOrganizationTO[]> = new SvelteMap();

		for (const person of personsOfOrganization) {
			const key = person.username.charAt(0).toUpperCase();
			if (!result.has(key)) {
				result.set(key, []);
			}
			result.get(key)!.push(person);
		}

		return [...result.entries()].toSorted(([a], [b]) => a.localeCompare(b));
	}

	async function onWriteToClipboard(): Promise<void> {
		await Clipboard.write({
			string: $organizationStore?.organizationInvitationCode.code
		});
		if (dev)
			await showAlert($t('routes.organization.members.page.invitation-code.clipboard.info'), {
				type: AlertType.SUCCESS
			});
	}

	async function onShare(): Promise<void> {
		const result = await Share.canShare();
		if (result.value) {
			const organizationName = $organizationStore?.name;
			const organizationCode = $organizationStore?.organizationInvitationCode.code;
			await Share.share({
				text: $t('routes.organization.members.page.invitation-code.share.text', {
					value: organizationName,
					value2: organizationCode
				}),
				title: $t('routes.organization.members.page.invitation-code.share.title', { value: organizationName }),
				url: `${environment.apiUrl}/organization/invitation/${organizationCode}`
			});
		} else {
			await showAlert($t('routes.organization.members.page.invitation-code.share.error'));
		}
	}

	async function onRenewCode(): Promise<void> {
		const response = await organizationService.renewInvitationCode($organizationStore?.id!);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update($organizationStore?.id!);
		}
	}

	async function showQRCode(): Promise<void> {
		qrModalOpen = true;
	}

	async function onSendMail(): Promise<void> {
		try {
			const hasAccountResult = await EmailComposer.hasAccount();
			await (hasAccountResult.hasAccount
				? EmailComposer.open({
						body: $t('routes.organization.members.page.invitation-code.email.body', {
							value: $organizationStore?.organizationInvitationCode.code
						}),
						subject: $t('routes.organization.members.page.invitation-code.email.subject', {
							value: $organizationStore?.name
						})
					})
				: showAlert($t('routes.organization.members.page.invitation-code.email.error')));
		} catch {
			await showAlert($t('routes.organization.members.page.invitation-code.email.unsupported'));
		}
	}

	async function onSearch(event: CustomEvent): Promise<void> {
		searchValue = event.detail.value;
	}
</script>

<Layout title={$t('routes.organization.members.page.title')} showBackButton>
	{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
		<FabButton
			tourId={TourStepId.MEMBERS.INVITE}
			indexed="/organization/members"
			indexLabel={$t('routes.organization.members.page.fab.invite-members.title')}
			icon={personAddOutline}
			clicked={() => (invitationCodeModalOpen = true)}
			accessible="ROLE_ORGANIZATION_MANAGER"
		/>
		{#if pendingPersonsOfOrganization.length > 0}
			{@render pendingMembersCard()}
		{/if}
	{/if}

	<ion-searchbar
		debounce={100}
		placeholder={$t('routes.organization.members.page.searchbar.placeholder')}
		onionInput={onSearch}
		value={searchValue}
	></ion-searchbar>

	{#if filteredPersonsOfOrganization.length > 0}
		{@render personsOfOrganizationList()}
	{:else if searchValue}
		{@render noSearchResults()}
	{:else}
		{@render noMembers()}
	{/if}
</Layout>

<!-- Snippets-->

{#snippet pendingMembersCard()}
	<Card title={$t('routes.organization.members.page.card.pending-members.title')} border="warning" classList="mt-5">
		{#each pendingPersonsOfOrganization as person (person.id)}
			{@render pendingMemberItem(person)}
		{/each}
	</Card>
{/snippet}

{#snippet noMembers()}
	<div class="mt-5 flex flex-col items-center justify-center gap-5">
		<ion-note>{$t('routes.organization.members.page.no-members')}</ion-note>
		<Button
			icon={personAddOutline}
			label={$t('routes.organization.members.page.invite')}
			clicked={() => (invitationCodeModalOpen = true)}
		/>
	</div>
{/snippet}

{#snippet noSearchResults()}
	<FadeInOut>
		<div class="mt-5 flex flex-col items-center justify-center gap-5">
			<ion-note>No results found for "{searchValue}"</ion-note>
		</div>
	</FadeInOut>
{/snippet}

{#snippet personsOfOrganizationList()}
	<FadeInOut>
		<ion-list data-tour={TourStepId.MEMBERS.LIST}>
			{#each personOfOrganizationGroups as [letter, personOfOrganizationGroup] (letter)}
				<ion-item-group>
					<ion-item-divider class="bg-transparent">
						<ion-label>{letter}</ion-label>
					</ion-item-divider>

					{#each personOfOrganizationGroup as personOfOrganization (personOfOrganization.id)}
						{@render personOfOrganizationItem(personOfOrganization)}
					{/each}
				</ion-item-group>
			{/each}
		</ion-list>
	</FadeInOut>
{/snippet}

{#snippet personOfOrganizationItem(personOfOrganization: PersonOfOrganizationTO)}
	<CustomItem
		slidingOptions={personOfOrganization.userId === userId
			? undefined
			: getPersonOfOrganizationSlidingOptions(personOfOrganization)}
	>
		<ion-avatar class="mb-2">
			<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
		</ion-avatar>
		<ion-label class="ms-6">{personOfOrganization.username}</ion-label>
	</CustomItem>
{/snippet}

{#snippet pendingMemberItem(personOfOrganization: PersonOfOrganizationTO)}
	<CustomItem slidingOptions={getPendingPersonOfOrganizationSlidingOptions(personOfOrganization)}>
		<ion-avatar class="mb-2">
			<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
		</ion-avatar>
		<ion-label class="my-0 ms-6">{personOfOrganization.username}</ion-label>
	</CustomItem>
{/snippet}

<!-- Modals -->

<!-- Invitation Code Modal -->
<Modal open={invitationCodeModalOpen} informational dismissed={() => (invitationCodeModalOpen = false)} lazy>
	<Card title={$t('routes.organization.members.page.modal.invitation-code.card.title')}>
		<div class="flex flex-col">
			<div class="mx-12 rounded border border-(--ion-color-primary) p-2 text-center font-extrabold">
				<ion-note color="tertiary" class="text-2xl">
					{invitationCode.toUpperCase()}
				</ion-note>
			</div>
			<div class="mt-2 text-center">
				{#if isExpired}
					<ion-note color="danger">
						{$t('routes.organization.members.page.modal.invitation-code.card.note.code-expired')}
					</ion-note>
				{:else}
					<ion-note>
						{$t('routes.organization.members.page.modal.invitation-code.card.note.expires-in')}
						{formatDistanceToNow(invitationCodeExpiration, {
							addSuffix: true,
							includeSeconds: true,
							locale: getDateFnsLocale($localeStore)
						})}
					</ion-note>
				{/if}
			</div>
			<div class="mx-14 mt-2 flex items-center justify-between gap-2">
				<Button disabled={isExpired} icon={shareOutline} clicked={onShare} />
				<Button disabled={isExpired} icon={clipboardOutline} clicked={onWriteToClipboard} />
				<Button disabled={isExpired} icon={mailOutline} clicked={onSendMail} />
				<Button disabled={isExpired} icon={qrCode} clicked={showQRCode} />
			</div>
			<Button
				icon={refreshCircleOutline}
				fill="outline"
				classList="mx-8 mt-5"
				label={$t('routes.organization.members.page.modal.invitation-code.card.button.renew')}
				clicked={onRenewCode}
			/>
		</div>
	</Card>
</Modal>

<!-- QR Code Modal -->
<Popover extended open={qrModalOpen} dismissed={() => (qrModalOpen = false)}>
	{#if invitationCode}
		<div class="pt-2 text-center">
			<ion-label class="font-bold">{$t('routes.organization.members.page.modal.qr-code.info-text')}</ion-label>
			<ion-breadcrumbs>
				<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
					<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={accessibilityOutline}></ion-icon>
					{$t('routes.organization.members.page.modal.qr-code.breadcrumb.first')}
				</ion-breadcrumb>
				<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
					<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={personAddOutline}></ion-icon>Join
					{$t('routes.organization.members.page.modal.qr-code.breadcrumb.second')}
				</ion-breadcrumb>
				<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
					<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={qrCodeOutline}></ion-icon>
				</ion-breadcrumb>
			</ion-breadcrumbs>
		</div>
		<QRCode content={invitationCode} responsive="true" padding="0" />
	{/if}
</Popover>
